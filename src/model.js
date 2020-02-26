
import query from './querying';

/**
 * Abstract base class for Model definitions.
 */
export default class Model {

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

  query() {
    return query();
  }
}
