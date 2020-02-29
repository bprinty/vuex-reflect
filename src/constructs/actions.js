/*
 * All store actions and action factories assocaited with library.
 */


import _ from 'lodash';
import axios from 'axios';


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

  // use axios if no promise specified
  if (_.isString(action)) {
    action = axios.post(action, data).then(response => response.data);
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

  // run data validation
  // TODO

  // use axios if no promise specified
  if (_.isString(action)) {
    action = action.replace(':id', data.id)
    action = axios.put(action, data).then(response => response.data);
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

  // run data validation
  // TODO

  // use axios if no promise specified
  if (_.isString(action)) {
    action = axios.put(action, data).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    console.log(data);
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
