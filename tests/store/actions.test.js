/**
 * Testing for api actions and data retrieval.
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
describe("model.actions", () => {
  let collection;
  let model;

  test("model.fetch", async () => {
    // assert pre-fetch
    collection = store.getters.posts();
    assert.equal(collection.length, 0);

    // fetch collection
    collection = await store.dispatch("posts.fetch");
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // get post count
    collection = store.getters.posts();
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // get single post
    model = store.getters.posts(1);
    assert.equal(model.id, 1);
  });

  test("model.create", async () => {
    // fetch collection
    await store.dispatch("posts.fetch");

    // get item count
    collection = store.getters.posts();
    assert.equal(collection.length, 2);

    // create new item
    model = await store.dispatch("posts.create", {
      title: 'a',
      body: 'aaa',
      author_id: 1,
    });
    assert.equal(model.id, 3);
    assert.equal(model.title, 'a');

    // get item count
    collection = store.getters.posts();
    assert.equal(collection.length, 3);

    // get single item
    model = store.getters.posts(3);
    assert.equal(model.title, 'a');
  });

  test("model.update", async () => {
    // fetch collection
    await store.dispatch("authors.fetch");

    // verify existing
    model = store.getters.authors(1);
    assert.equal(model.name, 'Jane Doe');

    // update
    model.name = 'a';
    model = await store.dispatch("authors.update", model);
    assert.equal(model.name, 'a');

    // verify store update
    model = store.getters.authors(1);
    assert.equal(model.name, 'a');
  });

  test("model.get", async () => {
    // fetch item
    model = await store.dispatch("authors.get", 1);
    assert.equal(model.name, 'Jane Doe');

    // verify getter
    model = store.getters.authors(1);
    assert.equal(model.name, 'Jane Doe');
  });

  test("model.delete", async () => {
    // fetch collection
    await store.dispatch("posts.fetch");

    // verify existing
    model = store.getters.posts(2);
    assert.equal(model.title, 'Bar');

    // delete
    await store.dispatch("posts.delete", 2);

    // verify store update
    model = store.getters.posts(2);
    assert.isUndefined(model);
  });

});


describe("model.invalid.actions", () => {
  let err;

  test("holder", async () => {
    assert.isTrue(true);
  });
});


describe("singleton.actions", () => {
  let obj;

  test("singleton.fetch", async () => {
    // assert pre-fetch
    obj = store.getters.profile();
    assert.isEmpty(obj);

    // fetch singleton
    obj = await store.dispatch("profile.fetch");
    assert.equal(obj.username, 'admin');

    // get singleton
    obj = store.getters.profile();
    assert.equal(obj.username, 'admin');
  });

  // 
  // test("singleton.update", async () => {
  //   // fetch collection
  //   await store.dispatch("profile.fetch");
  //
  //   // verify existing
  //   obj = store.getters.profile();
  //   assert.equal(obj.username, 'admin');
  //
  //   // update
  //   obj.username = 'other';
  //   obj = await store.dispatch("profile.update", obj);
  //   assert.equal(obj.username, 'other');
  //
  //   // verify store update
  //   obj = store.getters.profile();
  //   assert.equal(obj.username, 'other');
  // });

  // test("singleton.get", async () => {
  //   // fetch item
  //   model = await store.dispatch("authors.get", 1);
  //   assert.equal(model.name, 'Jane Doe');
  //
  //   // verify getter
  //   model = store.getters.authors(1);
  //   assert.equal(model.name, 'Jane Doe');
  // });
  //
  // test("singleton.delete", async () => {
  //   // fetch collection
  //   await store.dispatch("authors.fetch");
  //
  //   // verify existing
  //   model = store.getters.authors(2);
  //   assert.equal(model.name, 'John Doe');
  //
  //   // delete
  //   await store.dispatch("authors.delete", 2);
  //
  //   // verify store update
  //   model = store.getters.authors(2);
  //   assert.isUndefined(model);
  // });

});


describe("singleton.invalid.actions", () => {
  let err;

  test("holder", async () => {
    assert.isTrue(true);
  });
});
