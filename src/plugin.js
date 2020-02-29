

import _ from 'lodash';
import axios from 'axios';


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
      store.registerModule(key, {
        namespaced: false,
        state: {
          [`${key}`]: {},
        },
        getters: {
          [`${key}`]: state => _.values(state[key]),
          [`${key}.get`]: state => id => state[key][id],
        },
        mutations: {
          [`${key}.add`]: (state, data) => {
            state[key] = _.clone(state[key]);
            state[key][data.id] = data
          },
          [`${key}.update`]: (state, data) => {
            state[key] = _.clone(state[key]);
            state[key][data.id] = Object.assign(state[key][data.id] || {}, data);
          },
          [`${key}.remove`]: (state, id) => {
            state[key] = _.clone(state[key]);
            delete state[key][id];
          },
        },
        actions: {
          [`${key}.fetch`]: ({ state, commit }) => {
            return axios.get(`/${key}`).then((response) => {
              const results = [];
              response.data.forEach((item) => {
                commit(`${key}.add`, item);
                results.push(state[key][item.id]);
              });
              return results;
            });
          },
          [`${key}.create`]: ({ state, commit }, data) => {
            return axios.post(`/${key}`, data).then((response) => {
              commit(`${key}.add`, response.data);
              return state[key][response.data.id];
            });
          },
          [`${key}.update`]: ({ state, commit }, data) => {
            return axios.put(`/${key}/${data.id}`, data).then((response) => {
              commit(`${key}.update`, response.data);
              return state[key][response.data.id];
            });
          },
          [`${key}.get`]: ({ state, commit }, id) => {
            return axios.get(`/${key}/${id}`).then((response) => {
              commit(`${key}.update`, response.data);
              return state[key][response.data.id];
            });
          },
          [`${key}.delete`]: ({ state, commit }, id) => {
            return axios.delete(`/${key}/${id}`).then((response) => {
              commit(`${key}.remove`, id);
              return null;
            });
          }
        },
      });
    });

    return store;
  }
}
