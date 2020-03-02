/*
 * All store actions and action factories assocaited with library.
 */


// imports
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
function formatPush(contract, data) {
  return _.reduce(contract, (result, spec, key) => {

    // check if data required
    if (_.has(spec, 'required') && spec.required) {
      if (!_.has(result, key) && !_.has(result, spec.to)) {
        const msg = _.template('Key `${key}` is required for create and update actions.');
        throw msg({ key: spec.to || key });
      }
    }

    // return if contract param not in data
    if (!_.has(result, key)) {
      return result;
    }
    let value = result[key];

    // if collapse is specified and the data has the key
    if (_.has(spec, 'collapse') && _.isObject(value)) {

      // input doesn't have collapseable data
      if (!_.has(value, spec.collapse)) {
        const msg = _.template('Could not collapse input for `${key}` using key `${collapse}` from data `${value}`');
        throw msg({ key, value, collapse: spec.collapse });
      }

      // collapse and remove original data
      value = value[spec.collapse]
      result[key] = value;
    }

    // validate inputs
    if (_.has(spec, 'validate')){
      const check = spec.validate.check || spec.validate;
      const msg = _.template(spec.validate.message || 'Value `${value}` for key `${key}` did not pass validation.');
      if (!check(value)) {
        throw msg({ value, key });
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
      value = spec.mutate(value);
      result[key] = value;
    }

    // rename request param via `to` configuration
    if (_.has(spec, 'to')) {
      result[spec.to] = value;
      delete result[key];
      key = spec.to;
    }

    return result;
  }, _.clone(data));
}


/**
 * Helper function for processing data payload according
 * to contract spec. This function will apply parsing rules
 * and name remapping logic to data received from requests..
 *
 * @param {object} contract - Contract specifying how data should
 *     be processed.
 * @param {object} data - Data to process.
 */
function formatPull(contract, data) {

  // construct rename mapping
  const mapping = _.reduce(contract, (result, spec, param) => {
    result[spec.from || param] = param;
    return result;
  }, {});

  // process payload from defaults
  const processed = _.reduce(data, (result, value, key) =>{

    // process from
    const target = mapping[key] || key;

    // parse result
    if (_.has(contract[target], 'parse')) {
      value = contract[target].parse(value);
    }

    // store reformatted result
    result[target] = value;
    return result;
  }, _.mapValues(contract, 'default'));

   return processed;
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
  return action.then((collection) => {
    return collection.map((data) => {
      const processed = formatPull(config.contract, data);
      context.commit(`${model}.sync`, processed);
      return context.state[model][data.id];
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
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
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
  const payload = formatPush(config.contract, data);

  // use axios if no promise specified
  if (_.isString(action)) {
    action = axios.post(action, payload).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
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
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
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
  const payload = formatPush(config.contract, data);

  // use axios if no promise specified
  if (_.isString(action)) {
    action = action.replace(':id', data.id)
    action = axios.put(action, payload).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
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
  const payload = formatPush(config.contract, data);

  // use axios if no promise specified
  if (_.isString(action)) {
    action = axios.put(action, payload).then(response => response.data);
  }

  // commit data after promise resolves with data
  return action.then((data) => {
    const processed = formatPull(config.contract, data);
    context.commit(`${model}.sync`, processed);
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
