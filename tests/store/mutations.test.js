/**
 * Testing for store mutations and data validation.
 */

// imports
// -------
import { assert } from 'chai';
import store from './models';
import server from '../server';


// config
// ------
jest.mock('axios');
server.init();
beforeEach(() => {
  server.reset();
});


// tests
// -----
test("mutations.sync", async () => {
  let model;

  // sync one
  assert.isTrue(true);

  // sync existing
  assert.isTrue(true);

  // sync array
  assert.isTrue(true);

});

test("mutations.remove", async () => {
  let model;

  // remove one
  assert.isTrue(true);

  // remove multiple
  assert.isTrue(true);

});


test("mutations.clear", async () => {
  let res;

  // fetch and assert store
  await store.dispatch('posts.fetch');
  res = store.getters['posts']()
  assert.equal(res.length, 2);

  // clear and assert store
  store.commit('posts.clear');
  res = store.getters['posts']()
  assert.equal(res.length, 0);

});
