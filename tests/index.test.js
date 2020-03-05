/**
 * Testing for package.
 */


// imports
// -------
import Vue from 'vue';
import Vuex from 'vuex';
import { assert } from 'chai';
import { Reflect } from '../src/index';


// plugin setup
// ------------
Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    ping: null,
  },
  mutations: {
    ping(state) {
      state.ping = 'pong';
    },
  },
  actions: {
    ping(context) {
      return new Promise((resolve) => {
        resolve('pong');
      });
    },
  },
  plugins: [Reflect({})],
});


// tests
// -----
describe("config", () => {

  test("config.constructs", () => {
    assert.equal(store.state.ping, null);
    store.commit('ping');
    assert.equal(store.state.ping, 'pong');
    store.dispatch('ping').then((data) => {
      assert.equal(data, 'pong');
    });
  });

  test("config.axios", () => {
    assert.isTrue(true);
  });

});
