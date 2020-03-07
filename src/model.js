
import _ from 'lodash';
import { operator } from './querying';


function parseModel(model, value) {

  // cast nested data into object
  if (_.isPlainObject(value)) {
    if (_.isNil(value.id)) {
      throw `Nested inputs for property \`${key}\` must have \`id\` property.`;
    }
    if (Object.keys(value).length === 1) {
      value = value.id;
    } else {
      value = new model(value);
    }
  }

  // cast id input into object from store or empty shell
  if (_.isInteger(value)) {
    value = model.query(value) || { id: value };
  }

  return value;
}


function normalizeInputs(contract, data) {
  return _.reduce(contract, (result, spec, key) => {
    let value = result[key] || result[spec.to || key];
    result[key] = setContractValue(spec, key, value);
    return result;
  }, data);
}


/**
 * Abstract base class for Model definitions.
 */
export class Model {

  /**
   * Model constructor.
   *
   * @param {object} data - Data to instantiate model with.
   */
  constructor(data) {
    data = data || {};

    // setup
    this.__actions__ = this.constructor.api();
    this.__contract__ = this.constructor.props();
    this.id = data.id;

    // build nested model mapping
    this.__remap__ = _.reduce(this.__contract__, (result, spec, key) => {
      if (_.has(spec, 'to') && spec.to) {
        result[spec.to] = key;
      }
      return result;
    }, {});

    // set up local store, accounting for nested models
    this._ = _.reduce(data, (result, value, prop) => {
      if (_.has(this.__remap__, prop)) {
        result[prop] = value;
        prop = this.__remap__[prop];
      }
      if (_.has(this.__contract__[prop], 'model')) {
        value = parseModel(this.__contract__[prop].model, value);
      }
      result[prop] = value;
      return result;
    }, this.constructor.__getter__('defaults'));

    // set up store proxy
    this.$ = new Proxy({}, {
      get: (obj, prop) => {
        const state = this.constructor.__getter__('one', this.id);
        if (_.isNil(state)) {
          return undefined;
        }
        return state[prop];
      },
      set: (obj, prop, value) => {
        throw 'Cannot set properties directly on the store';
      },
    });

    // return local proxy
    return new Proxy(this, {
      get: (obj, prop) => {
        // if id for model, get it directly
        if (prop === 'id') {
          return obj.id;
        }

        // get local copy of data
        if (_.has(obj._, prop)) {
          return obj._[prop];
        }

        // everything else
        else {
          return obj[prop];
        }
      },
      set: (obj, prop, value) => {
        // id changes
        if (prop === 'id') {

          // protect model integrity for instances with id
          if (!_.isNil(obj.id) && !_.isNil(value) && obj.id !== value) {
            throw 'Cannot set `id` for a Model instance - please query for new model instance.';
          }
          obj.id = value;
        }

        // everything else
        else {
          // account for nested model mapping
          if (_.has(this.__remap__, prop)) {
            prop = this.__remap__[prop];
          }
          if (_.has(this.__contract__[prop], 'model')) {
            value = parseModel(this.__contract__[prop].model, value);
          }
          obj._[prop] = value;
        }

        return true;
      },
      deleteProperty: (obj, prop) => {
        if (_.has(obj._, prop)) {
          delete obj._[prop];
        }
        return true;
      }
    });
  }

  /**
   * Proxy for using registered store getter for specific model.
   *
   * @param {string} method - Getter method to access.
   * @param {array} args - Extra arguments to pass to downstream callables.
   */
  static __getter__(method, ...args) {
    if (_.isNil(this.__store__) || _.isNil(this.__name__)) {
      throw 'Model must be registered with Vuex store for data management.';
    }
    method = method || 'all';
    return this.__store__.getters[`${this.__name__}.${method}`](...args);
  }

  /**
   * Proxy for using registered store actions for specific model.
   *
   * @param {string} method - Action method to access.
   * @param {array} args - Extra arguments to pass to downstream callables.
   */
  static __dispatch__(method, ...args) {
    if (_.isUndefined(this.__store__) || _.isUndefined(this.__name__)) {
      throw 'Model must be registered with Vuex store for data management.';
    }
    return this.__store__.dispatch(`${this.__name__}.${method}`, ...args);
  }

  /**
   * Proxy for using registered store mutations for specific model.
   *
   * @param {string} method - Action method to access.
   * @param {array} args - Extra arguments to pass to downstream callables.
   */
  static __mutate__(method, ...args) {
    if (_.isUndefined(this.__store__) || _.isUndefined(this.__name__)) {
      throw 'Model must be registered with Vuex store for data management.';
    }
    return this.__store__.commit(`${this.__name__}.${method}`, ...args);
  }

  /**
   * Query store for new models and return generator function for
   * dispatching query filters and resolvers.
   */
  static query(id) {

    // get data for query
    const data = this.__getter__('all', id);

    // return object if query has inputs
    if (!_.isNil(id)) {

      // if id was integer, return the data or undefined
      if (_.isInteger(id)) {
        return _.isPlainObject(data) ? new this(data) : undefined;
      }

      // otherwise, make a collection of objects
      else {
        return data.map(item => new this(item));
      }

    }

    // return query operator on data
    return operator(this, data);
  }

  /**
   * Dispatch fetch action to retrieve all model data. This returns
   * a collection of new objects of a model's type.
   *
   * @param {object} params - URL parameters for fetch operations.
   */
  static fetch(params) {
    return this.__dispatch__('fetch', params).then(data => data.map(item => new this(item)));
  }

  /**
   * Dispatch get action to retrieve model data for a single
   * instance. This returns an instantiated object of a
   * model's type.
   *
   * @param {integer} id - Identifier for model to query.
   */
  static get(id) {
    return this.__dispatch__('get', id).then(data => new this(data));
  }

  /**
   * Remove all model instances from vuex store.
   */
  static clear() {
    this.constructor.__mutate__('clear');
  }

  /**
   * API config for fetching and updating data. This method must
   * be defined by classes inheriting from this model type.
   *
   * @returns {object} Object of api configuration.
   */
  static api() {
    throw 'Extensions of `Model` class must override `static api()` static method.';
  }

  /**
   * Property definitions for the model.
   *
   * @returns {object} Object of api configuration.
   */
  static props() {
    return {};
  }

  /**
   * Relationships to other objects tracked by the orm.
   *
   * @returns {object} Object of api configuration.
   */
  static relations() {
    return {};
  }

  /**
   * Nested actions for model.
   *
   * @returns {object} Object of with configuration for nested actions.
   */
  static actions() {
    return {};
  }

  /**
   * Nested queries for model.
   *
   * @returns {object} Object of with configuration for nested queries.
   */
  static queries() {
    return {};
  }


  /**
   * Commit data to external API and update store to reflect
   * data updates.
   */
  commit() {
    const payload = this.json();
    if (_.isNil(this.id)) {
      delete payload.id;
    }
    const action = _.has(self.__actions__, 'update') ? 'update' : 'create';
    return this.constructor.__dispatch__(action, payload).then((data) => {
      this.update(data);
      return this;
    });
  }

  /**
   * Issue delete action and update store to reflect updates.
   */
  delete() {
    if (_.isNil(this.id)) {
      throw 'Cannot delete model instance without id.';
    }
    return this.constructor.__dispatch__('delete', this.id).then(() => {
      this.id = undefined;
    });
  }

  /**
   * Update data for multiple keys at once.
   *
   * @param {object} data - Object with data to update model with.
   */
  update(data) {
    // leverage proxy setters to update data
    _.reduce(data, (result, value, param) => {
      this[param] = value;
    }, {});
    return this;
  }

  /**
   * Remove model instance from store.
   */
  remove() {
    this.constructor.__mutate__('remove', this.id);
    return this;
  }

  /**
   * Return javascript Object representing current model and nested
   * configuration.
   */
  json() {
    return _.clone(this._);
  }
}

export class Singleton extends Model {

  constructor() {
    super();
    this.update(this.constructor.__getter__('one'));
  }

  /**
   * Override query method to throw an error.
   */
  static query() {
    throw '`query()` static method not available for Singleton models.';
  }

  /**
   * Dispatch fetch action to retrieve singleton data. This returns
   * a collection of new objects of a model's type.
   *
   * @param {object} params - URL parameters for fetch operations.
   */
  static fetch(params) {
    return this.__dispatch__('fetch', params).then(data => new this(data));
  }


  /**
   * Dispatch fetch action to retrieve singleton data. This returns
   * a collection of new objects of a model's type.
   */
  static get() {
    return this.fetch();
  }

  /**
   * Commit data to external API and update store to reflect
   * data updates.
   */
  commit() {
    const payload = this.json();
    return this.constructor.__dispatch__('update', payload).then((data) => {
      this.update(data);
      return this;
    });
  }

  /**
   * Issue delete action and update store to reflect updates.
   */
  delete() {
    return this.constructor.__dispatch__('delete');
  }

}

export default {
  Singleton,
  Model,
};
