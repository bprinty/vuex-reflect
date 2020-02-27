
/**
 * Abstract base class for Model definitions.
 */
export default class Model {

  constructor(data) {
    this.contract = this.props();
    this.endpoints = this.api();

    // model props
    this.id = null;

    // store snapshot
    this.$ = Proxy({}, {
      get: (obj, prop) => {
        // // look into using store.watch() for watching state changes for model instance
        // store.getters(`${name}`, this.id).prop;
      },
      set: (obj, prop, value) => {
        throw 'Cannot set properties directly on the store';
      }
    });
  }

  /**
   * API config for fetching and updating data.
   */
  api() {
    return {
      model: null,
      collection: null,
    };
  }

  /**
   * Property definitions for the model.
   */
  props() {
    return {};
  }

  /**
   * Relationships to other objects tracked by the orm.
   */
  relationships() {
    return {};
  }

}
