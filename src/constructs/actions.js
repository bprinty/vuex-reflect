/*
 * All store actions and action factories assocaited with library.
 */


import _ from 'lodash';
import axios from 'axios';

// config
_.templateSettings.interpolate = /\${([\s\S]+?)}/g;

/**
 * Helper function for processing data payload according
 * to contract spec. This function will traverse data entries,
 * applying both validation and mutations specified in the
 * contract definition. Validation failures will throw a validation
 * error.
 *
 * @param {object} contract - Contract specifying how data should
 *     be processed.
 * @param {object} data - Data to process.
 */
function applyContract(contract, data) {
  data = _.clone(data);

  // collapse nested data
  Object.keys(contract).map((key) => {
    const spec = contract[key];

    // if collapse is specified and the data has the key
    if (_.has(spec, 'collapse') && _.has(data, key) && _.isObject(data[key])) {

      // input doesn't have collapseable data
      if (!_.has(data[key], spec.collapse)) {
        msg = _.template('Could not collapse input for `${key}` using key `${collapse}` from data `${value}`');
        throw msg({ collapse: spec.collapse, key: key, value: val });
      }

      // collapse and remove original data
      data[spec.collapse] = data[key][spec.collapse];
      delete data[key];
    }
  });

  // get full key list
  const params = _.union(Object.keys(contract), Object.keys(data));

  // process contract
  const values = params.map((key) => {
    let val = data[key] || contract[key].default || null;

    // process entry if key in contract
    if (_.has(contract, key)) {
      const spec = contract[key];

      // required
      if (spec.required) {
        if (!_.has(data, key)) {
          const msg = _.template('Key `${key}` is required for create and update actions.');
          throw msg({ value: val, key: key });
        }
      }

      // validation
      if (_.has(spec, 'validate')){
        const check = spec.validate.check || spec.validate;
        const message = _.template(spec.validate.message || 'Value ${value} for key ${key} did not pass validation.');
        if (!check(val)) {
          throw message({ value: val, key: key });
        }
      }

      // // cast type (if not model type)
      // if (_.has(spec, 'type')) {
      //   if (!(spec.type instanceof String) && !(val instanceof spec.type)) {
      //     val = spec.type(val);
      //   }
      // }

      // mutation
      if (_.has(spec, 'mutate')) {
        val = spec.mutate(val);
      }

    }
    return val;
  });

  return _.zipObject(params, values);
}


/**
 * Action for fetching model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 */
function fetchCollection(context, config, model) {

  // use fetch or collection config
  let action = config.api.fetch || config.api.collection;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'fetch' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    action = axios.get(action).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    return data.map((item) => {
      context.commit(`${model}.sync`, item);
      return context.state[model][item.id];
    });
  });

}

/**
 * Action for fetching singleton model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 */
function fetchSingleton(context, config, model) {

  // use fetch, get, or model config
  let action = config.api.fetch || config.api.get || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'fetch' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    action = axios.get(action).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    context.commit(`${model}.sync`, data);
    return context.state[model];
  });

}


/**
 * Action for creating model and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {string} data - Data to use for creating model.
 */
function createModel(context, config, model, data) {

  // use create or collection config
  let action = config.api.create || config.api.collection;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'create' option.`;
  }

  // process inputs and apply mutations
  const payload = applyContract(config.contract, data);

  // use axios if no promise specified
  if (_.isString(action)) {
    action = axios.post(action, payload).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    context.commit(`${model}.sync`, data);
    return context.state[model][data.id];
  });
}


/**
 * Action for fetching model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {string} id - Id for model to get.
 */
function getModel(context, config, model, id) {

  // use get or model config
  let action = config.api.get || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'get' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    action = action.replace(':id', id)
    action = axios.get(action).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    context.commit(`${model}.sync`, data);
    return context.state[model][id];
  });
}

/**
 * Action for updating model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {string} data - Data to use for updating existing model.
 */
function updateModel(context, config, model, data) {

  if (!_.has(data, 'id')) {
    throw `Update action for model ${model} must include 'id' key.`;
  }

  // use update or model config
  let action = config.api.update || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'update' option.`;
  }

  // process inputs and apply mutations
  const payload = applyContract(config.contract, data);

  // use axios if no promise specified
  if (_.isString(action)) {
    action = action.replace(':id', data.id)
    action = axios.put(action, payload).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    context.commit(`${model}.sync`, data);
    return context.state[model][data.id];
  });
}


/**
 * Action for updating singleton data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {string} data - Data to use for updating existing model.
 */
function updateSingleton(context, config, model, data) {

  // use update or model config
  let action = config.api.update || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Singleton '${model}' has no configuration for 'update' option.`;
  }

  // process inputs and apply mutations
  const payload = applyContract(config.contract, data);

  // use axios if no promise specified
  if (_.isString(action)) {
    action = axios.put(action, payload).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    context.commit(`${model}.sync`, data);
    return context.state[model];
  });
}


/**
 * Action for updating model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {integer} id - Id of model to delete.
 */
function deleteModel(context, config, model, id) {

  // use update or model config
  let action = config.api.delete || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Model '${model}' has no configuration for 'delete' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    action = action.replace(':id', id)
    action = axios.delete(action).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    context.commit(`${model}.remove`, id);
    return;
  });
}


/**
 * Action for deleting singleton data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {integer} id - Id of model to delete.
 */
function deleteSingleton(context, config, model) {

  // use delete or model config
  let action = config.api.delete || config.api.model;

  // throw if no fetch configuration
  if (action === undefined) {
    throw `Singleton '${model}' has no configuration for 'delete' option.`;
  }

  // use axios if no promise specified
  if (_.isString(action)) {
    action = axios.delete(action).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    context.commit(`${model}.reset`);
    return;
  });
}


/**
 * Action factory function for returning get methods based
 * on model config.
 */
export default function actionFactory(config) {
  return {
    fetch: config.singleton ? fetchSingleton : fetchCollection,
    create: config.singleton ? createModel : createModel,
    get: config.singleton ? fetchSingleton : getModel,
    update: config.singleton ? updateSingleton : updateModel,
    delete: config.singleton ? deleteSingleton : deleteModel,
  };
}
