/**
 * Testing for store mutations and data validation.
 */

// imports
// -------
import { assert } from 'chai';
import store from './models';
import { Profile, Post, Author } from './models';
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
test("props.default", async () => {
  let model;

  model = await Post.get(1);
  assert.equal(model.title, 'Foo');
  assert.equal(model.footer, 'footer');

});

test("props.validate", async () => {
  let model;

  try {
    model = new Author({ name: 'a', email: 'a' });
    await model.commit();
    assert.fail('Create with invalid data should have failed.');
  } catch(err) {
    assert.equal(err, "`a` is not a valid email.");
  }

});

test("props.required", async () => {
  let model;

  // missing not required key
  model = new Author({ name: 'a' });
  await model.commit();
  assert.equal(model.name, 'a');
  assert.equal(model.email, null);

  // missing required key
  try {
    model = new Author({ email: 'a@a.com' });
    await model.commit();
    assert.fail('Expected create to fail requirement check.');
  } catch (err) {
    assert.equal(err, 'Key `name` is required for create and update actions.');
  }

});

test("contract.mutate", async () => {
  let model;

  model = new Post({ title: 'aaa', body: 'a', author_id: 1 });
  await model.commit();
  assert.equal(model.body, '<div>a</div>');

});

test("contract.parse", async () => {
  let model;

  model = await Post.get(1);
  assert.equal(model.title, 'Foo');
  assert.equal(model.slug, 'foo');

});

test("contract.collapse", async () => {
  let model;

  model = new Post({
    title: 'aba',
    body: 'bbb',
    author: { id: 2 },
  });
  await model.commit();
  assert.equal(model.title, 'aba');
  assert.equal(model.author.id, 2);

});
