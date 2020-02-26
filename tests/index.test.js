/**
 * Testing for package.
 */


// imports
// -------
import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import { Model, Reflect } from '../src/index';

if (typeof assert === 'undefined') {
  var assert = require('chai').assert;
}

// config
// ------
beforeEach(() => {
  // NOOP
});

afterEach(() => {
  // NOOP
});


// axios mock
// ----------
import _ from 'lodash';

jest.mock('axios');

// STOPPED HERE -- ISSUES WITH DESTRUCTURING OUTPUTS

// helpers
function model(name) {
  return {
    get: (id) => { id: id, ...db[name][id] },
    put: (id, data) => {
      Object.assign(db[name][id], data);
      return { id: id, ...db[name][id] };
    },
    delete: (id) => {
      delete db[name][id];
    },
  };
};

function collection(name) {
  return {
    get: () => Object.keys(db[name]).map(key => { id: key, ...db[name][key] }),
    post: (data) => {
      const id = _.max(Object.keys(db[name]));
      db[name][id] = data;
      return db[name][id];
    },
  };
}

function normalize(url) {
  let id = null;
  let endpoint = url;
  const re = /\/(\d+)/;
  const matches = url.match(re);
  if (matches !== null) {
    id = matches[0];
    endpoint = url.replace(re, '/:id');
  }
  return { id, endpoint };
}

// database
const db = {
  'profile': {
    name: 'Current User',
    email: 'current@user.com',
  },
  'posts': {
    1: { title: 'Foo', body: 'foo bar baz', author_id: 1 },
    2: { title: 'Bar', body: 'bar baz', author_id: 1 },
  },
  'authors': {
    1: { name: 'Jane Doe', email: 'jane@doe.com' },
    2: { name: 'John Doe', email: 'john@doe.com' },
  },
}

// api
const api = {
  '/profile': {
    get: () => db.profile,
  },
  '/posts': collection('posts'),
  '/posts/:id': model('posts'),
  '/posts/:id/author': {
    get: id => db.authors[id],
  },
  '/authors': collection('authors'),
  '/authors/:id': model('authors'),
  '/authors/:id/posts': {
    get: id => db.posts.filter(x => x.author_id === id),
  },
};

// mocks
axios.get.mockImplementation((url) => {
  const { id, endpoint } = normalize(url);
  return new Promise((resolve, reject) => {
    if (!(endpoint in api) || api[endpoint] === null) {
      reject(`URL ${url} not in API`);
    }
    if (id === null) {
      resolve(api[endpoint].get());
    } else {
      resolve(api[endpoint].get(id));
    }
  });
});

axios.post.mockImplementation((url, data) => {
  const endpoint = url;
  return new Promise((resolve, reject) => {
    if (!(endpoint in api) || api[endpoint] === null) {
      reject(`URL ${url} not in API`);
    }
    resolve(api[endpoint].post(data));
  });
});

axios.put.mockImplementation((url, data) => {
  const { id, endpoint } = normalize(url);
  return new Promise((resolve, reject) => {
    if (!(endpoint in api) || api[endpoint] === null) {
      reject(`URL ${url} not in API`);
    }
    resolve(api[endpoint].put(id, data));
  });
});

axios.delete.mockImplementation((url) => {
  const { id, endpoint } = normalize(url);
  return new Promise((resolve, reject) => {
    if (!(endpoint in api) || api[endpoint] === null){
      reject(`URL ${url} not in API`);
    }
    resolve(api[endpoint].delete(id));
  });
});

axios.mockImplementation(params => axios[data.method](params.url, params.data));



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


// tests
// -----
describe("store configuration", function () {

  it("extra constructs work", function () {
      assert.equal(store.state.ping, null);
      store.commit('ping');
      assert.equal(store.state.ping, 'pong');
      store.dispatch('ping').then((data) => {
        assert.equal(data, 'pong');
      });
  });

  it("plugin registered", function () {
      assert.equal(store._subscribers.length, 1);
  });

  it("api mocks return data", function() {
      axios.get('/posts').then((response) => {
        console.log(response);
        console.log(response.data);
      })
  });
});
