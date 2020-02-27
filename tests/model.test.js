/**
 * Testing for ORM portion of package.
 */


// imports
// -------
import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import { Reflect } from '../src/index';
import mock from './mock';
import server from './server';
import models from './models';

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
  plugins: [database],
});


// tests
// -----
describe("properties", () => {
  test("placeholder", () => {
    assert.isTrue(true);
  });
});

describe("api", () => {
  test("placeholder", async () => {
    assert.isTrue(true);
  });
});

describe("relationships", () => {
  test("placeholder", () => {
    assert.isTrue(true);
  });
});

describe("querying", () => {
  test("placeholder", () => {
    assert.isTrue(true);
  });
});
