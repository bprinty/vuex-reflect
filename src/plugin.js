

import axios from 'axios';
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
      const config = models[key];
      const get = getterFactory(config);
      const mutate = mutationFactory(config);
      const act = actionFactory(config);
      store.registerModule(key, {
        namespaced: false,
        state: {
          [`${key}`]: config.singleton ? config.default || null : {},
        },
        getters: {
          [`${key}`]: state => input => get.base(state, key, input),
          [`${key}.sample`]: state => n => get.sample(state, key, n),
        },
        mutations: {
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
