/**
 * Testing for store getters and data retrieval.
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
describe("getters", () => {
  let res;

  test("model", async () => {
    // fetch collection
    await store.dispatch("authors.fetch");

    // all
    res = store.getters.authors();
    assert.equal(res.length, 2);
    assert.equal(res[0].name, 'Jane Doe');

    // subset by id
    res = store.getters.authors([2]);
    assert.equal(res.length, 1);
    assert.equal(res[0].name, 'John Doe');
    res = store.getters.authors([1, 2]);
    assert.equal(res.length, 2);
    assert.equal(res[0].name, 'Jane Doe');

    // one
    res = store.getters.authors(2);
    assert.equal(res.name, 'John Doe');

    // missing
    res = store.getters.authors(9000);
    assert.isUndefined(res);

  });

  test("sample", async () => {
    // fetch collection
    await store.dispatch("authors.fetch");

    // one
    res = store.getters['authors.sample']();
    assert.isTrue('name' in res);

    // some
    res = store.getters['authors.sample'](2);
    assert.equal(res.length, 2);
    assert.isTrue('name' in res[0]);
  });

});
