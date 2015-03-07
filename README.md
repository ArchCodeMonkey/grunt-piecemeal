# grunt-piecemeal

> Concatenates individual script folders and checks dependencies.

## Overview
This plugin will identify all subfolders within the specified source folder and generate a file ++for each++ subfolder in the specified output folder. The contents of an output file will be the concatenation of every file matching a configurable file extension within the corresponding source subfolder. The order of inclusion in the concatenation can be controlled through the use of specific tags within the source files.

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-piecemeal --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-piecemeal');
```

## The "piecemeal" task

### Grunt Configuration
In your project's Gruntfile, add a section named `piecemeal` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  piecemeal: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Grunt Options

#### options.useStrict
Type: `Boolean`
Default value: `true`

This value indicates whether the string `'use strict;'` should be added to the head of each output file.

#### options.fileExtension
Type: `String`
Default value: `'.js'`

This value indicates the file extension to search for when reading files for processing and the file extension to use when writing files for output.

### Indicating a dependency

#### Load-time dependency
A load-time dependency on another file ++within the same folder++ can be created by adding a `@depends` tag for the file (excluding the file extension) to a block comment within the source file.

```js
/**
 * @depends SomeFile
 */
```

#### Run-time dependency
A run-time dependency on another file can be created by adding a `@references` tag for the file (excluding the file extension) to a block comment within the source file.

```js
/**
 * @references SomeFile
 */
```

A reference can be made to a file in another folder by prefixing the folder name to the file name.

```js
/**
 * @references SomeFolder:SomeFile
 */
```

### Error Conditions
The following error conditions can be detected during processing and will terminate execution with a `grunt.fail.fatal` error.

#### Unresolved Dependency
If an `@depends` declaration cannot resolve the referenced file within the current folder the following error is produced:
```
Fatal error: Unresolved dependency 'missing' for item 'f' in library 'lib_b'.
```

#### Unresolved Reference
If an `@references` declaration cannot resolve the referenced file within the specified folder (or the current folder if one is not specified) the following error is produced:

```
Fatal error: Unresolved reference to item 'missing' in library 'lib_a' for item 'g' in library 'lib_c'.
```

#### Cyclic Dependency
From [Wikipedia](http://en.wikipedia.org/wiki/Circular_dependency),
> 'a circular dependency is a relation between two or more modules which either directly or indirectly depend on each other to function properly'

For example, if item '`a`' declared a dependence on item '`b`' which in turn declared a dependence on item '`a`' then this would be a cyclic dependency and there is no way to reliably determine the ordering to satisfy this requirement
```
a -> b -> a
```
This plugin uses [Topological Sorting](http://en.wikipedia.org/wiki/Topological_sorting) when determining the inclusion order for the files within a folder and to detect cyclic dependencies. If a cyclic dependency is identified the following error is produced:
```
Fatal error: Cyclic dependency detected when evaluating item 'd' in library 'lib_a'.
```

## Usage Example

### Sample Data
The following example uses the folder structure for the standard nodeunit tests provided with this package:

```shell
test
└── standard
    ├── lib_a
    │   ├── a.js
    │   ├── b.js
    │   ├── c.js
    │   └── d.js
    ├── lib_b
    │   ├── e.js
    │   ├── f.js
    │   └── z.vbs
    └── lib_c
        ├── g.js
        └── h.js
```

The contents of the files within the `lib_a` folder are as follows:

####a.js

```js
/**
 * @depends c
 * @references d
 * @references lib_b:e
 */

// This is file 'a' in 'lib_a'

```

####b.js

```js
/**
 * @references d
 * @references lib_b:e
 */

// This is file 'b' in 'lib_a'

```

####c.js

```js
/**
 * @depends b
 * @references d
 */

// This is file 'c' in 'lib_a'

```

####d.js

```js

// This is file 'd' in 'lib_a'

```

### Results
The following file structure would be generated in the specified output folder (assuming a task configuration of `dest: 'tmp/default/'`):

```shell
tmp
└── default
    ├── lib_a.js
    ├── lib_b.js
    └── lib_c.js
```

After running, the contents of the `lib_a.js` file is as follows (assuming the `useStrict` option is not overridden):

```js
"use strict";

/**
 * @references d
 * @references lib_b:e
 */

// This is file 'b' in 'lib_a'
/**
 * @depends b
 * @references d
 */

// This is file 'c' in 'lib_a'
/**
 * @depends c
 * @references d
 * @references lib_b:e
 */

// This is file 'a' in 'lib_a'

// This is file 'd' in 'lib_a'

```

It can be seen that the dependency chain
```
a -> c -> b
```
has been reflected in the order of inclusion of the files.

## Enhancements
As it stands, this plugin meets the particular use case that prompted its creation. However, requests for enhancement will be considered should additional functionality be desired.

## Release History
* **v0.1.0** (2015-03-07) *Initial release*

## License
Copyright (c) 2015 . Licensed under the MIT license.

---

*This file was created using [Haroopad](http://pad.haroopress.com/user.html) for Windows.*