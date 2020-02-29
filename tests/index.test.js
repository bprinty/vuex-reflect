/**
 * Testing for package.
 */


// imports
// -------
import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import { Model, Reflect } from '../src/index';
import mock from './mock';
import server from './server';

if (typeof assert === 'undefined') {
  var assert = require('chai').assert;
}

// config
// ------
jest.mock('axios');
server.init();

beforeEach(() => {
  // NOOP
});

afterEach(() => {
  // NOOP
});


// plugin setup
// ------------
const database = Reflect({});

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
  plugins: [database],
});


// api
// ---
describe("api mock", () => {
  let res;

  beforeEach(() => {
    server.reset();
  });

  test("404", async () => {
    try {
      await axios.get('/missing');
      assert.fail('Request returned response instead of 404.');
    } catch (err) {
      assert.equal(err.status, 404);
    }
  });

  test("GET", async () => {
    // collection
    res = await axios.get('/posts');
    assert.equal(res.status, 200);
    assert.equal(res.data.length, 2);

    // model
    res = await axios.get('/posts/1');
    assert.equal(res.status, 200);
    assert.equal(res.data.title, 'Foo');
  });

  test("POST", async () => {
    // create
    const author = { name: 'Foo Bar', email: 'foo@bar.com' };
    res = await axios.post('/authors', author);
    assert.equal(res.status, 201);
    assert.equal(res.data.name, 'Foo Bar');

    // verify
    res = await axios.get('/authors/3');
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'Foo Bar');
  });

  test("PUT", async () => {
    // check
    res = await axios.get('/authors/1');
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'Jane Doe');

    // update
    res = await axios.put('/authors/1', { name: 'test' });
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'test');

    // verify
    res = await axios.get('/authors/1');
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'test');
  });

  test("DELETE", async () => {
    // check
    res = await axios.get('/authors/1');
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'Jane Doe');

    // delete
    res = await axios.delete('/authors/1');
    assert.equal(res.status, 204);

    // verify
    try {
      await axios.get('/authors/1');
      assert.fail('Request returned response instead of 404.');
    } catch(err) {
      assert.equal(err.status, 404);
    }
  });
});


// setup
// -----
describe("store configuration", () => {

  test("extra constructs work", () => {
      assert.equal(store.state.ping, null);
      store.commit('ping');
      assert.equal(store.state.ping, 'pong');
      store.dispatch('ping').then((data) => {
        assert.equal(data, 'pong');
      });
  });

});
