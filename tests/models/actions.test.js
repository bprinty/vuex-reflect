/**
 * Testing for api actions and data retrieval.
 */

// imports
// -------
import { assert } from 'chai';
import server from '../server';
import { Profile, Post, Author } from './models';
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
    collection = Post.query().all();
    assert.equal(collection.length, 0);

    // fetch collection
    collection = await Post.fetch();
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // get post count
    collection = Post.query().all();
    assert.equal(collection.length, 2);
    assert.equal(collection[0].id, 1);

    // check nested payloads
    assert.equal(collection[0].author.id, 1);

    // get single post
    model = Post.query(1);
    assert.equal(model.id, 1);
  });

  test("model.create", async () => {
    const author = await Author.get(1);

    // create new item with id
    model = new Post({
      title: 'a',
      body: 'aaa',
      author_id: author.id,
    });
    assert.isUndefined(model.id);
    assert.isUndefined(model.$.title);
    assert.equal(model.title, 'a');
    assert.equal(model.footer, 'footer');
    assert.equal(model.author_id, 1);
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');
    await model.commit();
    assert.equal(model.id, 3);
    assert.equal(model.$.title, 'a');
    assert.equal(model.title, 'a');
    assert.equal(model.footer, 'footer');
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');

    // create new item with nested data
    model = new Post({
      title: 'b',
      body: 'bbb',
      author: { id: author.id },
    });
    assert.isUndefined(model.id);
    // here
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');
    await model.commit();
    assert.equal(model.id, 4);
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');

    // create new item with nested object
    model = new Post({
      title: 'b',
      body: 'bbb',
      author: author,
    });
    assert.isUndefined(model.id);
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');
    await model.commit();
    assert.equal(model.id, 5);
    assert.equal(model.author.id, 1);
    assert.equal(model.author.name, 'Jane Doe');

  });

  test("model.update", async () => {

    // verify existing
    await Author.fetch()
    model = Author.query(1);
    assert.equal(model.name, 'Jane Doe');
    assert.equal(model.$.name, 'Jane Doe');

    // update
    model.name = 'a';
    assert.equal(model.name, 'a');
    assert.equal(model.$.name, 'Jane Doe');
    await model.commit();
    assert.equal(model.name, 'a');
    assert.equal(model.$.name, 'a');

    // update nested item with id
    model = await Post.get(1);
    assert.equal(model.title, 'Foo')
    assert.equal(model.$.title, 'Foo')
    assert.equal(model.author.id, 1);
    assert.equal(model.$.author.id, 1);
    model.update({
      title: 'a',
      body: 'aaa',
      author_id: 2,
    });
    assert.equal(model.title, 'a');
    assert.equal(model.$.title, 'Foo');
    assert.equal(model.author.id, 2);
    assert.equal(model.$.author.id, 1);
    await model.commit();
    assert.equal(model.title, 'a');
    assert.equal(model.$.title, 'a');
    assert.equal(model.author.id, 2);
    assert.equal(model.$.author.id, 2);


    // update nested item with model instance
    model = await Post.get(2);
    assert.equal(model.title, 'Bar')
    assert.equal(model.$.title, 'Bar')
    model.update({
      title: 'b',
      body: 'bbb',
      author: Author.query(2),
    });
    assert.equal(model.title, 'b');
    assert.equal(model.$.title, 'Bar');
    assert.equal(model.author.id, 2);
    assert.equal(model.$.author.id, 1);
    await model.commit();
    assert.equal(model.title, 'b');
    assert.equal(model.$.title, 'b');
    assert.equal(model.author.id, 2);
    assert.equal(model.$.author.id, 2);
  });

  test("model.get", async () => {
    // fetch item
    model = await Author.get(1);
    assert.equal(model.name, 'Jane Doe');

    // fetch nested item
    model = await Post.get(1);
    assert.equal(model.title, 'Foo');
    assert.equal(model.author.id, 1);
  });

  test("model.delete", async () => {
    // fetch collection
    await Post.fetch();

    // verify existing
    model = Post.query(2);
    assert.equal(model.id, 2);
    assert.equal(model.title, 'Bar');

    // delete
    await model.delete();

    // verify store update
    model = Post.query(2);
    assert.isUndefined(model);
  });

});

// describe("model.invalid.actions", () => {
//   let err;
//   let model;
//
//   test("model.invalid.create", async () => {
//     // check validation
//     try {
//       await store.dispatch("authors.create", { name: 'a', email: 'a' });
//       throw 'Create with invalid data should have failed.';
//     } catch(err) {
//       assert.equal(err, "`a` is not a valid email.");
//     }
//
//     // check mutation
//     model = await store.dispatch("posts.create", { title: 'aaa', body: 'a', author_id: 1 });
//     assert.equal(model.body, '<div>a</div>');
//
//     // check required
//     try {
//       await store.dispatch("posts.create", { title: 'aaa', body: 'a' });
//       throw 'Required check on create operation failed.';
//     } catch(err) {
//       assert.equal(err, "Key `author_id` is required for create and update actions.");
//     }
//   });
//
//   test("model.invalid.update", async () => {
//     await store.dispatch('authors.fetch');
//     await store.dispatch('posts.fetch');
//
//     // check validation
//     try {
//       model = store.getters.authors(1);
//       model.email = 'a';
//       await store.dispatch("authors.update", model);
//       throw 'Create with invalid data should have failed.';
//     } catch(err) {
//       assert.equal(err, "`a` is not a valid email.");
//     }
//
//     // check mutation
//     model = store.getters.posts(1);
//     model.body = 'a'
//     model = await store.dispatch("posts.update", model);
//     assert.equal(model.body, '<div>a</div>');
//
//     // check required
//     try {
//       await store.dispatch("posts.create", { title: 'aaa', body: 'a' });
//       throw 'Required check on create operation failed.';
//     } catch(err) {
//       assert.equal(err, "Key `author_id` is required for create and update actions.");
//     }
//   });
//
// });
//
//
// describe("singleton.actions", () => {
//   let obj;
//
//   test("singleton.fetch", async () => {
//     // assert pre-fetch
//     obj = store.getters.profile();
//     assert.isEmpty(obj);
//
//     // fetch singleton
//     obj = await store.dispatch("profile.fetch");
//     assert.equal(obj.username, 'admin');
//
//     // get singleton
//     obj = store.getters.profile();
//     assert.equal(obj.username, 'admin');
//   });
//
//
//   test("singleton.update", async () => {
//     // fetch collection
//     await store.dispatch("profile.fetch");
//
//     // verify existing
//     obj = store.getters.profile();
//     assert.equal(obj.username, 'admin');
//
//     // update
//     obj.username = 'other';
//     obj = await store.dispatch("profile.update", obj);
//     assert.equal(obj.username, 'other');
//
//     // verify store update
//     obj = store.getters.profile();
//     assert.equal(obj.username, 'other');
//   });
//
//   test("singleton.get", async () => {
//     // get singleton
//     obj = await store.dispatch("profile.get");
//     assert.equal(obj.username, 'admin');
//
//     // singleton getter
//     obj = store.getters.profile();
//     assert.equal(obj.username, 'admin');
//   });
//
//   test("singleton.delete", async () => {
//     // fetch collection
//     await store.dispatch("profile.fetch");
//
//     // verify existing
//     obj = store.getters.profile();
//     assert.equal(obj.username, 'admin');
//
//     // delete
//     await store.dispatch("profile.delete");
//
//     // verify store update
//     obj = store.getters.profile();
//     assert.isEmpty(obj);
//   });
//
// });
//
//
// describe("singleton.invalid.actions", () => {
//   let err;
//   let obj;
//
//   test("singleton.invalid.update", async () => {
//     await store.dispatch('profile.fetch');
//
//     // check validation
//     obj = store.getters.profile();
//     obj.username = ' ';
//     try {
//       await store.dispatch("profile.update", obj);
//       assert.fail('Create with invalid data should have failed.');
//     } catch(err) {
//       assert.equal(err, "Value ` ` for key `username` did not pass validation.");
//     }
//
//     // check mutation
//     obj = store.getters.profile();
//     obj.username = 'NewUser';
//     obj = await store.dispatch("profile.update", obj);
//     assert.equal(obj.username, 'newuser');
//
//     // check required
//     try {
//       await store.dispatch("profile.update", {});
//       assert.fail('Required check on update operation failed.');
//     } catch(err) {
//       assert.equal(err, "Key `username` is required for create and update actions.");
//     }
//   });
// });
