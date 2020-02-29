/**
 * Testing for store mutations and data validation.
 */

// imports
// -------
import server from '../server';
import { assert } from 'chai';


// config
// ------
jest.mock('axios');
server.init();
beforeEach(() => {
  server.reset();
});


// tests
// -----
describe("contract", () => {

  // TODO: TEST VALIDATION

  test("noop", async () => {
    assert.isTrue(true);
  });

});
