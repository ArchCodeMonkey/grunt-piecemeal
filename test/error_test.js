'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.piecemeal = {
   setUp: function (done)
   {
      // setup here if necessary
      done();
   },

   error_cycle: function (test)
   {
      test.expect(2);

      grunt.util.spawn({grunt: true, args: ["piecemeal:error_cycle"]}, function(oError, oResult, nCode)
      {
         test.equal(nCode, grunt.fail.code.FATAL_ERROR, 'Returned error is the correct type.');

         var nIndex = oResult.toString().indexOf("Cyclic dependency");
         test.ok((nIndex >= 0), "Returned error contains the correct message.");

         test.done();
      });
   },

   error_dependency: function (test)
   {
      test.expect(2);

      grunt.util.spawn({grunt: true, args: ["piecemeal:error_dependency"]}, function(oError, oResult, nCode)
      {
         test.equal(nCode, grunt.fail.code.FATAL_ERROR, 'Returned error is the correct type.');

         var nIndex = oResult.toString().indexOf("Unresolved dependency");
         test.ok((nIndex >= 0), "Returned error contains the correct message.");

         test.done();
      });
   },

   error_reference: function (test)
   {
      test.expect(2);

      grunt.util.spawn({grunt: true, args: ["piecemeal:error_reference"]}, function(oError, oResult, nCode)
      {
         test.equal(nCode, grunt.fail.code.FATAL_ERROR, 'Returned error is the correct type.');

         var nIndex = oResult.toString().indexOf("Unresolved reference");
         test.ok((nIndex >= 0), "Returned error contains the correct message.");

         test.done();
      });
   },
};
