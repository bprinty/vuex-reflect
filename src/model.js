
import _ from 'lodash';


function setContractValue(spec, key, value) {

  // cast type
  if (_.has(spec, 'type')) {
    if (_.isFunction(spec.type)) {
      value = spec.type(value);
    }
  }

  // cast model
  if (_.has(spec, 'model')) {

    // cast nested data into object
    if (_.isPlainObject(value)) {
      if (_.isNil(value.id)) {
        throw `Nested inputs for property \`${key}\` must have \`id\` property.`;
      }
      if (Object.keys(value).length == 1) {
        value = value.id;
      } else {
        value = new spec.model(value);
      }
    }

    // cast id input into object from store or empty shell
    if (_.isInteger(value)) {
      value = spec.model.query(value) || { id: value };
    }

    // invalid input to nested model
    else if (!(value instanceof spec.model)) {
      throw `Invalid input for \`${key}\` property.`;
    }
  }

  // validate inputs
  if (_.has(spec, 'validate')){
    const check = spec.validate.check || spec.validate;
    const msg = _.template(spec.validate.message || 'Value `${value}` for key `${key}` did not pass validation.');
    if (!check(value)) {
      throw msg({ value, key });
    }
  }

  // mutation
  if (_.has(spec, 'mutate')) {
    value = spec.mutate(value);
  }

  return value;
}


function applyContract(contract, data) {
  return _.reduce(contract, (result, spec, key) => {
    let value = result[key] || result[spec.to || key];
    result[key] = setContractValue(spec, key, value);
    return result;
  }, data);
}


/**
 * Abstract base class for Model definitions.
 */
export default class Model {

  /**
   * Model constructor.
   *
   * @param {object} data - Data to instantiate model with.
   */
  constructor(data) {

    // if no data applied, use template
    this.__contract__ = this.constructor.props();
    this.__template__ = this.constructor.__getter__('template');
    data = Object.assign(_.clone(this.__template__), data);
    data = applyContract(this.__contract__, data);
    this.id = data.id;

    // set up store proxy
    this.$ = new Proxy({}, {
      get: (obj, prop) => {
        if (_.isNil(this.id)) {
          return undefined;
        }
        return this.constructor.__getter__('one', this.id)[prop];
      },
      set: (obj, prop, value) => {
        throw 'Cannot set properties directly on the store';
      },
    });

    // return local proxy
    this._ = Object.assign({}, data);
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
          if (_.has(this.__contract__, prop)) {
            value = setContractValue(this.__contract__[prop], prop, value);
          }
          obj._[prop] = value;
        }

        return true;
      },
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
   * Query store for new models and return generator function for
   * dispatching query filters and resolvers.
   */
  static query(id) {

    // get data for query
    const data = this.__getter__('all', id);

    // return object if query has inputs
    if (!_.isUndefined(id)) {

      // if id was integer, return the data or undefined
      if (_.isInteger(id)) {
        return _.isNil(data) ? undefined : new this(data);
      }

      // otherwise, make a collection of objects
      else {
        return data.map(item => new this(item));
      }

    }

    // return resolvers
    return {
      all: () => data.map(item => new this(item)),
      first: () => new this(data[0]),
      last: () => new this(data[data.length]),
    };
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
  static relationships() {
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
      return this.constructor.__dispatch__('create', payload).then((data) => {
        this.update(data);
      });
    } else {
      return this.constructor.__dispatch__('update', payload).then((data) => {
        this.update(data);
      });
    }
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
    data = applyContract(this.__contract__, data);
    _.reduce(data, (result, value, param) => {
      this[param] = value;
    }, {});
  }

  /**
   * Return Object representing current model and nested configuration
   * ... TODO
   */
  json() {
    return _.clone(this._);
  }
}
