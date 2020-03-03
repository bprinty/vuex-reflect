
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

    // model props
    this.id = data.id || null;

    // model props
    this._ = data;

    // TODO: if no data applied, use template

    // apply contract and set internal properties;

    // // store snapshot
    // this.$ = Proxy({}, {
    //   get: (obj, prop) => {
    //     // // look into using store.watch() for watching state changes for model instance
    //     // store.getters(`${name}`, this.id).prop;
    //   },
    //   set: (obj, prop, value) => {
    //     throw 'Cannot set properties directly on the store';
    //   },
    // });
  }

  static query() {
    const data = this.__store__.getters[this.__name__]();
    return {
      all: () => data.map(item => new this(item)),
      first: () => new this(data[0]),
      last: () => new this(data[data.length]),
    };
  }

  static fetch(params) {
    return this.__store__
               .dispatch(`${this.__name__}.fetch`, params)
               .then(data => data.map(item => new this(item)));
  }

  static get(input, params) {
    return this.__store__
               .dispatch(`${this.__name__}.get`, input, params)
               .then(data => new this(data));
  }

  commit() {
    const payload = _.clone(this._);
    if (this._.id === null) {
      delete payload.id;
      return this.__store__.dispatch(`${this.__name__}.create`, payload);
    } else {
      return this.__store__.dispatch(`${this.__name__}.update`, payload);
    }
  }

  /**
   * API config for fetching and updating data.
   */
  static api() {
    return {};
  }

  /**
   * Property definitions for the model.
   */
  static props() {
    return {};
  }

  /**
   * Relationships to other objects tracked by the orm.
   */
  static relationships() {
    return {};
  }
}
