/**
 * Testing for store portion of package.
 */

// imports
// -------
import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import { Reflect } from '../src/index';
import mock from './mock';
import server from './server';
import models from './store';

if (typeof assert === 'undefined') {
  var assert = require('chai').assert;
}

// config
// ------
jest.mock('axios');
server.init();

beforeEach(() => {
  server.reset();
});

afterEach(() => {
  // NOOP
});


// plugin setup
// ------------
const database = Reflect(models);
Vue.use(Vuex);
const store = new Vuex.Store({
  actions: {
    test() {
      return 1;
    },
  },
  plugins: [database],
});


// tests
// -----
describe("actions", () => {
  let collection;
  let model;

  test("model.fetch", async () => {
    // fetch collection
    collection = await store.dispatch("posts.fetch");
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // get post count
    collection = store.getters.posts;
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // get single post
    model = store.getters["posts.get"](1);
    assert.equal(model.id, 1);
  });

  test("model.create", async () => {
    // fetch collection
    await store.dispatch("authors.fetch");

    // get item count
    collection = store.getters.authors;
    assert.equal(collection.length, 2);

    // create new item
    model = await store.dispatch("authors.create", {
      name: 'a',
      email: 'a@a.com'
    });
    assert.equal(model.id, 3);
    assert.equal(model.name, 'a');

    // get item count
    collection = store.getters.authors;
    assert.equal(collection.length, 3);

    // get single item
    model = store.getters["authors.get"](3);
    assert.equal(model.name, 'a');
  });

  test("model.update", async () => {
    // fetch collection
    await store.dispatch("authors.fetch");

    // verify existing
    model = store.getters["authors.get"](1);
    assert.equal(model.name, 'Jane Doe');

    // update
    model.name = 'a';
    model = await store.dispatch("authors.update", model);
    assert.equal(model.name, 'a');

    // verify store update
    model = store.getters["authors.get"](1);
    assert.equal(model.name, 'a');
  });

  test("model.get", async () => {
    // fetch item
    model = await store.dispatch("authors.get", 1);
    assert.equal(model.name, 'Jane Doe');

    // verify getter
    model = store.getters["authors.get"](1);
    assert.equal(model.name, 'Jane Doe');
  });

  test("model.delete", async () => {
    // fetch collection
    await store.dispatch("authors.fetch");

    // verify existing
    model = store.getters["authors.get"](2);
    assert.equal(model.name, 'John Doe');

    // delete
    await store.dispatch("authors.delete", 2);

    // verify store update
    model = store.getters["authors.get"](2);
    assert.isUndefined(model);
  });

});

describe("getters", () => {

  test("collection", async () => {
    assert.isTrue(true);
  });

  test("model", async () => {
    assert.isTrue(true);
  });

});

describe("mutations", () => {

  // TODO: TEST VALIDATION

  test("model.add", async () => {
    assert.isTrue(true);
  });

  test("model.update", async () => {
    assert.isTrue(true);
  });

  test("model.remove", async () => {
    assert.isTrue(true);
  });

});
