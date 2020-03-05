/**
 * Testing for store getters and data retrieval.
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
server.reset();
beforeAll(async (done) => {
  await Post.fetch();
  await Author.fetch();
  done();
});


// tests
// -----
let result;

describe("query.base", () => {

  test("query.one", async () => {
    result = Post.query(1);
    assert.equal(result.id, 1);
  });

  test("query.several", async () => {
    result = Post.query([1, 2]);
    assert.equal(result[0].id, 1);
    assert.equal(result[1].id, 2);
  });

});

describe("query.filters", () => {

  test("query.filter", async () => {

    // single input
    result = Post.query().filter({ title: 'Bar' }).one();
    assert.equal(result.id, 2);

    // multiple inputs
    result = Post.query().filter({ title: 'Bar', body: false }).one();
    assert.isUndefined(result);
    result = Post.query().filter({ title: 'Bar', body: 'bar baz' }).one();
    assert.equal(result.id, 2);

    // regular expression
    result = Post.query().filter({ body: /ba[rz]/ }).all();
    assert.equal(result.length, 2);
    result = Post.query().filter({ body: /foo/ }).all();
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 1);

    // callable
    result = Post.query().filter(x => x.title === 'Bar').one();
    assert.equal(result.id, 2)

    // chained
    result = Post.query().filter({ body: /ba[rz]/ }).filter(x => x.title === 'Bar').one();
    assert.equal(result.id, 2)

  });

  test("query.has", async () => {
    result = Post.query().has('footer').all();
    assert.equal(result.length, 2);

    await Post.query(1).update({ body: undefined }).commit();
    result = Post.query().has('body').all();
    assert.equal(result.length, 1);
  });

  test("query.offset", async () => {
    result = Post.query().offset(1).first();
    assert.equal(result.id, 2);
  });

  test("query.limit", async () => {
    result = Post.query().limit(1).all();
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 1);
  });

  test("query.order", async () => {
    // single key
    result = Post.query().order('title').first();
    assert.equal(result.id, 2);

    // multiple keys
    result = Post.query().order(['footer', 'title']).first();
    assert.equal(result.id, 2);

    // comparator function
    result = Post.query().order((a, b) => {
      if (a.title < b.title) {
        return -1;
      } else if (a.title > b.title) {
        return 1;
      }
      return 0;
    }).first();
    assert.equal(result.id, 2);
  });

});

describe("query.resolvers", () => {

  test("query.all", async () => {
    assert.isTrue(true);
  });

  test("query.first", async () => {
    assert.isTrue(true);
  });

  test("query.last", async () => {
    assert.isTrue(true);
  });

  test("query.random", async () => {
    assert.isTrue(true);
  });

  test("query.sample", async () => {
    assert.isTrue(true);
  });

  test("query.count", async () => {
    assert.isTrue(true);
  });

  test("query.sum", async () => {
    assert.isTrue(true);
  });

  test("query.min", async () => {
    assert.isTrue(true);
  });

  test("query.max", async () => {
    assert.isTrue(true);
  });

});
