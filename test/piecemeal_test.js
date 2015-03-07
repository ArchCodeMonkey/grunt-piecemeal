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

   default_options: function (test)
   {
      test.expect(3);

      var actual = grunt.file.read('tmp/default/lib_a.js');
      var expected = grunt.file.read('test/expected/default/lib_a.js');
      test.equal(actual, expected, 'First library file built correctly');

      actual = grunt.file.read('tmp/default/lib_b.js');
      expected = grunt.file.read('test/expected/default/lib_b.js');
      test.equal(actual, expected, 'Second library file built correctly');

      actual = grunt.file.read('tmp/default/lib_c.js');
      expected = grunt.file.read('test/expected/default/lib_c.js');
      test.equal(actual, expected, 'Third library file built correctly');

      test.done();
   },

   custom_options: function (test)
   {
      test.expect(3);

       var actual = grunt.file.read('tmp/custom/lib_a.js');
       var expected = grunt.file.read('test/expected/custom/lib_a.js');
       test.equal(actual, expected, 'First library file built correctly');

       actual = grunt.file.read('tmp/custom/lib_b.js');
       expected = grunt.file.read('test/expected/custom/lib_b.js');
       test.equal(actual, expected, 'Second library file built correctly');

       actual = grunt.file.read('tmp/custom/lib_c.js');
       expected = grunt.file.read('test/expected/custom/lib_c.js');
       test.equal(actual, expected, 'Third library file built correctly');

      test.done();
   }
};
