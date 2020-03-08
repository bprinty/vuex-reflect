

import _ from 'lodash';
import axios from 'axios';
import { Singleton } from './model';
import getterFactory from './constructs/getters';
import mutationFactory from './constructs/mutations';
import dispatchFactory from './constructs/actions';
import { relationFactory, actionFactory, queryFactory } from './constructs/relationships';


/**
 * Main entrypoint for Vuex Reflect plugin.
 */
export default function Reflect(models) {
  // sanitize inputs

  // configure options

  // set global axios instance?
  const options = {
    axios: {},
    methods: {
      'create': 'post',
      'update': 'put',
      'fetch': 'get',
      'get': 'get',
      'delete': 'delete',
      'patch': 'patch',
    }
  };

  const defaults = {
    name: null,
    singleton: false,
    api: {},
    contract: {},
    relations: {},
    actions: {},
    queries: {},
  };


  return (store) => {
    let schema = {};

    // populate initial schema
    Object.keys(models).forEach((key) => {

      // model-based definition
      if (!_.isPlainObject(models[key])) {
        models[key].__store__ = store;
        models[key].__name__ = key;
        schema[key] = {
          singleton: models[key].prototype instanceof Singleton,
          api: models[key].api(),
          contract: models[key].props(),
          relations: models[key].relations(),
          actions: models[key].actions(),
          queries: models[key].queries(),
          options: models[key].options(),
        }
      }

      // store-based definition
      else {
        schema[key] = Object.assign(_.clone(defaults), models[key]);
      }
      schema[key].name = key;
      schema[key].options = Object.assign(_.clone(options), schema[key].options);
    });

    // normalize configuration
    schema = _.reduce(schema, (result, config, name) => {

      // normalize contract key definitions into object
      _.each(config.contract, (value, key) => {
        if (!_.isObject(value)) {
          config.contract[key] = { default: value };
        }
      });

      // sanitize contract inputs (accounting for different naming)
      _.each(config.contract, (spec, param) => {
        if (_.has(spec, 'collapse') && _.isBoolean(spec.collapse)) {
          spec.collapse = 'id';
        }
        if (!_.has(spec, 'validate') && _.has(spec, 'validation')) {
          spec.validate = spec.validation;
        }
        if (!_.has(spec, 'mutate') && _.has(spec, 'mutation')) {
          spec.mutate = spec.mutation;
        }
      });

      // normalize queries/actions into single data structure
      _.each(config.queries || {}, (value, key) => {
        if (_.has(config.actions, key)) {
          if (!_.isObject(config.actions[key])) {
            config.actions[key] = {
              create: config.actions[key],
              update: config.actions[key],
              delete: config.actions[key],
            };
          }
          if (!_.isObject(value)) {
            value = { get: value, fetch: value };
          }
          config.actions[key] = Object.assign(config.actions[key], value);
        } else {
          if (!_.isObject(value)) {
            value = { fetch: value };
          }
          config.actions[key] = value;
        }
      });
      delete config.queries;

      result[name] = config;
      return result;
    }, {});

    // create store modules for each model
    _.map(schema, (config, model) => {

      // store constructs
      const get = getterFactory(config);
      const mutate = mutationFactory(config);
      const act = dispatchFactory(config);

      // additional actions
      const relations = relationFactory(schema, model);
      const actions = actionFactory(config);

      // register constructs
      store.registerModule(model, {
        namespaced: false,
        state: {
          [`${model}`]: config.singleton ? config.default || null : {},
        },
        getters: {
          [`${model}`]: state => input => get.base(state, config, input),
          [`${model}.one`]: state => input => get.base(state, config, input),
          [`${model}.all`]: state => input => get.base(state, config, input),
          [`${model}.sample`]: state => n => get.sample(state, config, n),
          [`${model}.template`]: state => () => get.template(config),
          [`${model}.defaults`]: state => () => get.defaults(config),
        },
        mutations: {
          [`${model}.clear`]: (state, data) => mutate.clear(state, config, data),
          [`${model}.sync`]: (state, data) => mutate.sync(state, config, data),
          [`${model}.reset`]: (state, id) => mutate.reset(state, config, id),
          [`${model}.remove`]: (state, id) => mutate.remove(state, config, id),
        },
        actions: {
          [`${model}.fetch`]: context => act.fetch(context, config),
          [`${model}.create`]: (context, data) => act.create(context, config, data),
          [`${model}.update`]: (context, data) => act.update(context, config, data),
          [`${model}.get`]: (context, id) => act.get(context, config, id),
          [`${model}.delete`]: (context, id) => act.delete(context, config, id),
          ...relations,
          ...actions,
        },
      });
    });

    return store;
  };
}
