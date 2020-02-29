/**
 * Testing for singleton contracts (i.e. profile).
 */

// imports
// -------
import { assert } from 'chai';
import server from '../server';
import store from './models';


// config
// ------
jest.mock('axios');
server.init();
beforeEach(() => {
  server.reset();
});


// tests
// -----
describe("local", () => {
  // TEST VALIDATION AND PROPERTY SETTING
  test("placeholder", () => {
    assert.isTrue(true);
  });
});

describe("store", () => {
  // TEST MODEL STATE ACCESS
  // TEST STORE UPDATES AND REFLECTION
  test("placeholder", async () => {
    assert.isTrue(true);
  });
});
