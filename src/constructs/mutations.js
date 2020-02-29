/*
 * All store mutations and mutation factories assocaited with library.
 */


import _ from 'lodash';


/**
 * Action for updating model data and committing
 * results to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {string} data - Data to use for updating existing model.
 */
function syncModel(state, config, model, data) {

  // TODO: NEED TO FIGURE OUT HOW TO IMPUTE DEFAULTS FROM CONFIG
  const defaults = {};

  if(!_.has(data, 'id')) {
    throw `Sync mutation for model ${model} must include 'id' key in mutation inputs.`;
  }
  state[model][data.id] = Object.assign(
    defaults,              // defaults are overriden by
    state[model][data.id], // current store data, which is overriden by
    data                   // new data inputs
  );
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
function syncSingleton(state, config, model, data) {

  // TODO: NEED TO FIGURE OUT HOW TO IMPUTE DEFAULTS FROM CONFIG
  const defaults = {};

  state[model] = Object.assign(
    defaults,      // defaults are overriden by
    state[model],  // current store data, which is overriden by
    data           // new data inputs
  );
}


/**
 * Action for removing model data from collection,
 * committing changes to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {integer} id - Id for model to remove from store.
 */
function removeModel(state, config, model, id) {
  delete state[model][id];
}


/**
 * Action for resetting model data from collection to defaults,
 * committing changes to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {integer} id - Id for model to reset in store.
 */
function resetModel(state, config, model, id) {

  // TODO: NEED TO FIGURE OUT HOW TO IMPUTE DEFAULTS FROM CONFIG
  const defaults = {};

  state[model][id] = Object.assign({ id }, defaults);
}


/**
 * Action for removing data and committing singleton
 * defaults back to to store.
 *
 * @param {object} context - Store action context.
 * @param {string} config - Model configuration.
 * @param {string} model - Name of model.
 * @param {string} data - Data to use for updating existing model.
 */
function resetSingleton(state, config, model, data) {

  // TODO: NEED TO FIGURE OUT HOW TO IMPUTE DEFAULTS FROM CONFIG
  const defaults = {};

  state[model] = Object.assign({}, defaults);
}


/**
 * Action factory function for returning get methods based
 * on model config.
 */
export default function mutationFactory(config) {
  return {
    sync: config.singleton ? syncSingleton : syncModel,
    remove: config.singleton ? resetSingleton : removeModel,
    reset: config.singleton ? resetSingleton : resetModel,
  };
}
