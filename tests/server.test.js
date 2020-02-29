/**
 * Testing for package.
 */


// imports
// -------
import axios from 'axios';
import { assert } from 'chai';
import server from './server';


// config
// ------
jest.mock('axios');
server.init();
beforeEach(() => {
  server.reset();
});


// tests
// -----
describe("api mock", () => {
  let res;

  test("404", async () => {
    try {
      await axios.get('/missing');
      assert.fail('Request returned response instead of 404.');
    } catch (err) {
      assert.equal(err.status, 404);
    }
  });

  test("GET", async () => {
    // collection
    res = await axios.get('/posts');
    assert.equal(res.status, 200);
    assert.equal(res.data.length, 2);

    // model
    res = await axios.get('/posts/1');
    assert.equal(res.status, 200);
    assert.equal(res.data.title, 'Foo');
  });

  test("POST", async () => {
    // create
    const author = { name: 'Foo Bar', email: 'foo@bar.com' };
    res = await axios.post('/authors', author);
    assert.equal(res.status, 201);
    assert.equal(res.data.name, 'Foo Bar');

    // verify
    res = await axios.get('/authors/3');
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'Foo Bar');
  });

  test("PUT", async () => {
    // check
    res = await axios.get('/authors/1');
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'Jane Doe');

    // update
    res = await axios.put('/authors/1', { name: 'test' });
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'test');

    // verify
    res = await axios.get('/authors/1');
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'test');
  });

  test("DELETE", async () => {
    // check
    res = await axios.get('/authors/1');
    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'Jane Doe');

    // delete
    res = await axios.delete('/authors/1');
    assert.equal(res.status, 204);

    // verify
    try {
      await axios.get('/authors/1');
      assert.fail('Request returned response instead of 404.');
    } catch(err) {
      assert.equal(err.status, 404);
    }
  });
});
