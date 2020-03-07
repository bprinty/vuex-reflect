

import _ from 'lodash';
import axios from 'axios';
import { Singleton } from './model';
import getterFactory from './constructs/getters';
import mutationFactory from './constructs/mutations';
import actionFactory from './constructs/actions';


/**
 * Main entrypoint for Vuex Reflect plugin.
 */
export default function Reflect(models) {
  // sanitize inputs

  // configure options

  // set global axios instance?


  return (store) => {
    Object.keys(models).forEach((key) => {
      let config;

      // configuration from models
      if(!_.isPlainObject(models[key])) {
        config = {
          singleton: models[key].prototype instanceof Singleton,
          api: models[key].api(),
          contract: models[key].props(),
        }
        models[key].__store__ = store;
        models[key].__name__ = key;
      }

      // configuration for store directly
      else {
        config = models[key];
      }

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

      // instantiate store constructs
      const get = getterFactory(config);
      const mutate = mutationFactory(config);
      const act = actionFactory(config);

      // register constructs
      store.registerModule(key, {
        namespaced: false,
        state: {
          [`${key}`]: config.singleton ? config.default || null : {},
        },
        getters: {
          [`${key}`]: state => input => get.base(state, key, input),
          [`${key}.one`]: state => input => get.base(state, key, input),
          [`${key}.all`]: state => input => get.base(state, key, input),
          [`${key}.sample`]: state => n => get.sample(state, key, n),
          [`${key}.template`]: state => () => get.template(config.contract),
          [`${key}.defaults`]: state => () => get.defaults(config.contract),
        },
        mutations: {
          [`${key}.clear`]: (state, data) => mutate.clear(state, config, key, data),
          [`${key}.sync`]: (state, data) => mutate.sync(state, config, key, data),
          [`${key}.reset`]: (state, id) => mutate.reset(state, config, key, id),
          [`${key}.remove`]: (state, id) => mutate.remove(state, config, key, id),
        },
        actions: {
          [`${key}.fetch`]: context => act.fetch(context, config, key),
          [`${key}.create`]: (context, data) => act.create(context, config, key, data),
          [`${key}.update`]: (context, data) => act.update(context, config, key, data),
          [`${key}.get`]: (context, id) => act.get(context, config, key, id),
          [`${key}.delete`]: (context, id) => act.delete(context, config, key, id),
        },
      });
    });

    return store;
  };
}
