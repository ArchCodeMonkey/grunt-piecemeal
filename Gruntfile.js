/*
 * grunt-piecemeal
 *
 *
 * Copyright (c) 2015
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt)
{
   // load all npm grunt tasks
   require('load-grunt-tasks')(grunt);

   // Project configuration.
   grunt.initConfig(
   {
      jshint:
      {
         all:
         [
            'Gruntfile.js',
            'tasks/*.js',
            'test/*.js'
         ],

         options:
         {
            jshintrc: '.jshintrc',
            reporter: require('jshint-stylish')
         }
      },

      // Before generating any new files, remove any previously-created files.
      clean:
      {
         tests: ['tmp']
      },

      // Configuration to be run (and then tested).
      piecemeal:
      {
         default_options:
         {
            src: ['test/standard/'],
            dest: 'tmp/default/'
         },

         custom_options:
         {
            options:
            {
               useStrict: false
            },

            src: ['test/standard/'],
            dest: 'tmp/custom/'
         },

         error_cycle:
         {
            src: ['test/dep_cycle/'],
            dest: 'tmp/dep_cycle/'
         },

         error_dependency:
         {
            src: ['test/dep_missing/'],
            dest: 'tmp/dep_missing/'
         },

         error_reference:
         {
            src: ['test/ref_missing/'],
            dest: 'tmp/ref_missing/'
         },
      },

      // Unit tests.
      nodeunit:
      {
         normal_tests: ['test/piecemeal_test.js'],
         error_tests: ['test/error_test.js']
      }
   });

   // Actually load this plugin's task(s).
   grunt.loadTasks('tasks');

   // Whenever the "test" task is run, first clean the "tmp" dir, then run this
   // plugin's task(s), then test the result.
   grunt.registerTask('test', ['clean', 'piecemeal:default_options', 'piecemeal:custom_options', 'nodeunit']);

   // By default, lint and run all tests.
   grunt.registerTask('default', ['jshint', 'test']);
};
