/**
 * Testing for package.
 */


// imports
// -------
if (typeof assert === 'undefined') {
  var assert = require('chai').assert;
}


// tests
// -----
describe("main", function () {

  before(function() {
    console.log('Set Up');
  });

  it("test should pass", function () {
      assert.ok(true);
  });

});
