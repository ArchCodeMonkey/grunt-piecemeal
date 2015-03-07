/*
 * grunt-piecemeal
 *
 *
 * Copyright (c) 2015
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt)
{
   grunt.registerMultiTask('piecemeal', 'Concatenates individual script folders and checks dependencies.', function()
   {
      // Merge task-specific and/or target-specific options with these defaults.
      var options = this.options(
      {
         useStrict : true,
         fileExtension : ".js"
      });


      /**
       * The Regular Expression to be used when identifying item dependencies
       * @type {RegExp}
       */
      var REGEX_DEPEND = /\s\*\s@depends\s(.+)/g;


      /**
       * The Regular Expression to be used when identifying item references
       * @type {RegExp}
       */
      var REGEX_REFERS = /\s\*\s@references\s(.+)/g;


      /**
       * This method finds all matches for a Regular Expression and returns the value of the capture group
       * @param {RegExp} oRegexLiteral The Regular Expression to be evaluated
       * @param {String} sInputData The string to be evaluated
       * @returns {string[]} The identified matches
       */
      var getRegexCaptures = function(oRegexLiteral, sInputData)
      {
         var oRegex = new RegExp(oRegexLiteral);
         var oCaptures = [];
         var oMatch = null;

         while (oMatch = oRegex.exec(sInputData))
         {
            oCaptures.push(oMatch[1]);
         }

         return oCaptures;
      };


      function LibraryItem(sItemName, sContents)
      {
         this.itemName = sItemName;
         this.contents = sContents;
         this.dependsOn = getRegexCaptures(REGEX_DEPEND, sContents);
         this.refersTo = getRegexCaptures(REGEX_REFERS, sContents);
         this.requiredBy = [];
         this.evaluating = false;
         this.added = false;

         this.toString = function()
         {
            return this.itemName;
         };
      }


      /**
       * This method performs a binary search of the input array for the provided value
       * @param {LibraryItem[]} oInputArray The array to search
       * @param {String} sSearchValue The value for which to search
       * @returns {number} An indicator of the search operation (The position in the array or -1 for not found)
       */
      var binarySearch = function(oInputArray, sSearchValue)
      {
         var nMax = oInputArray.length - 1;
         var nMid = 0;
         var nMin = 0;

         if (oInputArray.length === 0)
         {
            // The list is empty therefore the search value cannot be present
            return -1;
         }

         do
         {
            nMid = Math.floor(nMin + ((nMax - nMin) / 2));

            if (sSearchValue > oInputArray[nMid].itemName)
            {
               nMin = nMid + 1;
            }
            else
            {
               nMax = nMid - 1;
            }
         }
         while(oInputArray[nMid].itemName !== sSearchValue && nMin <= nMax);

         if (oInputArray[nMid].itemName === sSearchValue)
         {
            return nMid;
         }
         else
         {
            return -1;
         }
      };


      /**
       * This method load subfolders from specified source folder into a library
       * @param {String} sSourceFolder The source folder to load
       * @returns {Object} The loaded source files as an associative array of LibraryItem arrays
       */
      var readLibraryFiles = function(sSourceFolder)
      {
         var oLibrary = {};

         if (grunt.file.isDir(sSourceFolder))
         {
            grunt.file.recurse(sSourceFolder, function(sFullPath, sRootFolder, sCurrentFolder, sFileName)
            {
               var nIndex = sFileName.lastIndexOf('.');
               var sExtension = (nIndex > 0) ? sFileName.substr(nIndex) : "";

               if (sExtension === options.fileExtension && sCurrentFolder !== undefined)
               {
                  var sItemName = sFileName.replace(options.fileExtension, "");
                  var sContents = grunt.file.read(sFullPath);

                  if (oLibrary[sCurrentFolder] === undefined)
                  {
                     oLibrary[sCurrentFolder] = [];
                  }

                  oLibrary[sCurrentFolder].push(new LibraryItem(sItemName, sContents));
               }
            });

            for (var sLibrary in oLibrary)
            {
               oLibrary[sLibrary].sort();
            }
         }
         else
         {
            grunt.fail.warn("Expected a folder for source but found a file instead.");
         }

         return oLibrary;
      };


      /**
       * This method builds the dependency map and checks that declared references are available
       * @param {Object} oLibrary The library to be processed (an associative array of LibraryItem arrays)
       */
      var processDependencies = function(oLibrary)
      {
         var oItems = null;
         var sItemName = "";

         Object.keys(oLibrary).forEach(function(sLibrary)
         {
            oItems = this[sLibrary];

            oItems.forEach(function(oItem)
            {
               sItemName = oItem.itemName;

               oItem.dependsOn.forEach(function(sDependency)
               {
                  var nIndex = binarySearch(oItems, sDependency);

                  if (nIndex >= 0)
                  {
                     oItems[nIndex].requiredBy.push(oItem);
                  }
                  else
                  {
                     grunt.fail.fatal("Unresolved dependency '" + sDependency + "' for item '" + sItemName + "' in library '" + sLibrary + "'.");
                  }
               });

               oItem.refersTo.forEach(function(sReference)
               {
                  var oReference = sReference.split(":");
                  var sReferenceLibrary = (oReference.length === 1) ? sLibrary : oReference[0];
                  var sReferenceItem = (oReference.length === 1) ? oReference[0] : oReference[1];

                  var nIndex = binarySearch(oLibrary[sReferenceLibrary], sReferenceItem);

                  if (nIndex < 0)
                  {
                     grunt.fail.fatal("Unresolved reference to item '" + sReferenceItem + "' in library '" + sReferenceLibrary + "' for item '" + sItemName + "' in library '" + sLibrary + "'.");
                  }
               });
            });
         }, oLibrary);
      };


      /**
       * This helper method evaluates a node of the dependency map for topological sorting
       *    The algorithm used is adapted from {@link http://en.wikipedia.org/wiki/Topological_sorting#Algorithms}
       * @param {LibraryItem} oItem The item to be evaluated for dependency requirements
       * @param {LibraryItem[]} oOutputList The sorted list of items being built
       * @param {String} sLibrary The name of the library currently being processed
       */
      var evaluateLibraryItem = function(oItem, oOutputList, sLibrary)
      {
         if (oItem.evaluating)
         {
            grunt.fail.fatal("Cyclic dependency detected when evaluating item '" + oItem.itemName + "' in library '" + sLibrary + "'.");
         }

         if (!oItem.added)
         {
            oItem.evaluating = true;

            for (var i = 0; i < oItem.requiredBy.length; i++)
            {
               evaluateLibraryItem(oItem.requiredBy[i], oOutputList, sLibrary);
            }

            oItem.added = true;
            oItem.evaluating = false;
            oOutputList.splice(0, 0, oItem);
         }
      };


      /**
       * This method does a topological sort to fix dependency ordering and ensure that no cycles exist.
       *    The algorithm used is adapted from {@link http://en.wikipedia.org/wiki/Topological_sorting#Algorithms}
       * @param {Object} oLibrary The library to be sorted (an associative array of LibraryItem arrays)
       * @returns {Object} The sorted library as an associative array of LibraryItem arrays
       */
      var topologicalSort = function(oLibrary)
      {
         var oItems = null;
         var oSortedLibrary = {};

         for (var sLibrary in oLibrary)
         {
            oSortedLibrary[sLibrary] = [];
            oItems = oLibrary[sLibrary];

            for (var i = oItems.length - 1; i >= 0 ; i--)
            {
               if (!oItems[i].added)
               {
                  evaluateLibraryItem(oItems[i], oSortedLibrary[sLibrary], sLibrary);
               }
            }
         }

         return oSortedLibrary;
      };


      /**
       * This method outputs a library to files in the specified destination folder
       * @param {Object} oLibrary The library to be written (an associative array of LibraryItem arrays)
       * @param {String} sDestFolder The destination folder where files will be written
       */
      var writeLibraryFiles = function(oLibrary, sDestFolder)
      {
         if (!grunt.file.exists(sDestFolder))
         {
            grunt.file.mkdir(sDestFolder);
         }

         if (grunt.file.isDir(sDestFolder))
         {
            var nFileCount = 0;
            var oItems = null;
            var sFileData = "";
            var sFilePath = "";

            for (var sLibrary in oLibrary)
            {
               oItems = oLibrary[sLibrary];
               sFileData = options.useStrict ? '"use strict";\n\n' : "";

               for (var i = 0; i < oItems.length; i++)
               {
                  sFileData += oItems[i].contents;
               }

               sFilePath = sDestFolder + sLibrary + options.fileExtension;

               grunt.file.write(sFilePath, sFileData);
               grunt.verbose.writeln("File '" + sFilePath + "' created.");
               nFileCount++;
            }

            grunt.log.writeln(nFileCount + " file(s) written to '" + sDestFolder + "'.");
         }
         else
         {
            grunt.fail.warn("Expected a folder for destination but found a file instead.");
         }
      };


      // Iterate over all specified file groups.
      this.files.forEach(function(oFile)
      {
         oFile.src.forEach(function(sSourceFolder)
         {
            var oLibrary = readLibraryFiles(sSourceFolder);

            processDependencies(oLibrary);

            var oSortedLibrary = topologicalSort(oLibrary);

            writeLibraryFiles(oSortedLibrary, oFile.dest);
         });
      });
   });
};
