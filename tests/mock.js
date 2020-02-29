
// imports
// -------
import _ from 'lodash';
import axios from 'axios';


// parsers
// -------
/**
 * Parse :id parameter from url (making the assumption
 * that an id is numeric), and return the id and associated
 * abstract endpoint.
 *
 * @param {string} url - Url to parse.
 */
function normalize(url) {
  let id = null;
  let endpoint = url;
  const re = /\/(\d+)/;
  const matches = url.match(re);
  if (matches !== null) {
    id = matches[1];
    endpoint = url.replace(re, '/:id');
  }
  return { id, endpoint };
}

/**
 * Wrap data object with ID key for payload responses.
 *
 * @param {number} id - Identifier for model.
 * @param {object} data - Data structure to add identifer to.
 */
function indexed(id, data) {
  return Object.assign({ id: Number(id)}, data);
}


// classes
// -------
/**
 * Abstract base class for mocking server data. New mock servers
 * can be created by inheriting this class via `extends` and
 * overriding the `data()` and `api()` class methods.
 */
export class MockServer {

  constructor(name) {
    this.name = name || 'mock-server';
    this.db = {};

    // traverse data and format for easy storage
    _.each(this.data(), (val, key) => {

      // reduce list into dictionary with indices
      let idx = 1;
      this.db[key] = val.reduce((obj, item) => {
        obj[idx] = item
        idx += 1;
        return obj;
      }, {});
    });

    this._api = this.api();
  }

  /**
   * Generate default request processors for collection
   * endpoints, overriding the `get` and `post` handlers.
   *
   * @param {object} table - MockServer database table to
   *     generate urls for.
   */
  collection(name) {
    return {
      get: () => {
        return Object.keys(this.db[name]).map((id) => {
          return indexed(id, this.db[name][id]);
        });
      },
      post: (data) => {
        const id = Number(_.max(Object.keys(this.db[name]))) + 1;
        this.db[name][id] = data;
        return indexed(id, this.db[name][id]);
      },
    };
  }

  /**
   * Generate default request processors for model
   * endpoints, overriding the `get`, `put`, and `delete`
   * handlers.
   *
   * @param {object} table - MockServer database table to
   *     generate urls for.
   */
  model(name) {
    return {
      get: (id) => Object.assign({ id }, this.db[name][id]),
      put: (id, data) => {
        this.db[name][id] = Object.assign(this.db[name][id], data);
        return indexed(id, this.db[name][id]);
      },
      delete: (id) => {
        delete this.db[name][id];
      },
    };
  };


  /**
   * Method for defining internal database that will
   * be used throughout requests. This method allows
   * users to configure an initial `state` for the database
   * and all internal data models.
   */
  data() {
    return {};
  }

  /**
   * Method returning server endpoints with get/post/put/delete
   * request processing callables.
   */
  api() {
    return {};
  }

  /**
   * Reset internal database for server mock to original state.
   */
  reset() {
    let obj = new this.constructor();
    this.db = obj.db;
    obj = null;
  }

  /**
   * Initialize server mock and create fake callables for
   * all axios requests. This method should be called before tests
   * run or at the beginning of a test session.
   */
  init() {

    // GET
    axios.get.mockImplementation((url) => {
      const { id, endpoint } = normalize(url);
      return new Promise((resolve, reject) => {

        // handle invalid url
        if (!(endpoint in this._api) || this._api[endpoint] === null) {
          reject({
            status: 404,
            message: `URL ${url} not in API`,
          });
        }

        // collection request
        if (id === null) {
          resolve({
            status: 200,
            data: this._api[endpoint].get(),
          });
        }

        // model request
        else {

          // reject on missing model
          const result = this._api[endpoint].get(id);
          if (Object.keys(result).length === 1) {
            reject({
              status: 404,
              message: `Record ${id} not in API Database`,
            });
          }

          // return model
          else {
            resolve({
              status: 200,
              data: result,
            });
          }
        }
      });
    });

    // POST
    axios.post.mockImplementation((url, data) => {
      const { id, endpoint } = normalize(url);
      return new Promise((resolve, reject) => {

        // handle invalid url
        if (!(endpoint in this._api) || this._api[endpoint] === null) {
          reject({
            status: 404,
            message: `URL ${url} not in API`,
          });
        }

        // collection request
        if (id === null) {
          resolve({
            status: 201,
            data: this._api[endpoint].post(data),
          });
        }

        // model request
        else {
          resolve({
            status: 202,
            data: this._api[endpoint].post(id, data),
          });
        }
      });
    });

    // PUT
    axios.put.mockImplementation((url, data) => {
      const { id, endpoint } = normalize(url);
      return new Promise((resolve, reject) => {

        // handle invalid url
        if (!(endpoint in this._api) || this._api[endpoint] === null) {
          reject({
            status: 404,
            message: `URL ${url} not in API`,
          });
        }

        // call method
        resolve({
          status: 200,
          data: this._api[endpoint].put(id, data),
        });
      });
    });

    // DELETE
    axios.delete.mockImplementation((url) => {
      const { id, endpoint } = normalize(url);
      return new Promise((resolve, reject) => {

        // handle invalid url
        if (!(endpoint in this._api) || this._api[endpoint] === null){
          reject({
            status: 404,
            message: `URL ${url} not in API`,
          });
        }

        // call method
        resolve({
          status: 204,
          data: this._api[endpoint].delete(id)
        });
      });
    });

    axios.mockImplementation(params => axios[data.method](params.url, params.data));

  }

}
