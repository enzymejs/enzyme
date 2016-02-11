# Using Enzyme with JSDOM

JSDOM is a JavaScript based headless browser that can be used to create a realistic testing environment. 

Since enzyme's [`mount`](../api/mount.md) API requires a DOM, JSDOM is required in order to use 
`mount` if you are not already in a browser environment (ie, a Node environment).

For the best experience with enzyme, it is recommended that you load a document into the global 
scope *before* requiring React for the first time. It is very important that the below script
gets run *before* React's code is run.

As a result, a standalone script like the one below is generally a good approach:

```js
/* setup.js */

var jsdom = require('jsdom').jsdom;

var exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

documentRef = document;
```


## `describeWithDOM` API and clearing the document after every test

In previous versions of enzyme, there was a public `describeWithDOM` API which loaded in a new
JSDOM documnent into the global namespace before every test, ensuring that tests were deterministic
and did not have side-effects.

This approach is no longer recommended. React's source code makes several assumptions about the
environment it is running in, and one of them is that the `global.document` that is found at 
"require time" is going to be the one and only document it ever needs to worry about. As a result,
this type of "reloading" ends up causing more pain than it prevents.

It is important, however, to make sure that your tests using the global DOM APIs do not have leaky 
side-effects which could change the results of other tests. Until there is a better option, this is
left to you to ensure.


## JSDOM + Mocha

When testing with JSDOM, the `setup.js` file above needs to be run before the test suite runs. If
you are using mocha, this can be done from the command line using the `--require` option:

```bash
mocha --require setup.js --recursive path/to/test/dir
```


## Node.js Compatibility

Jsdom requires node 4 or above. As a result, if you want to use it with `mount`, you will need to 
make sure node 4 or iojs is on your machine. If you are stuck using an older version of Node, you
may want to try using a browser-based test runner such as [Karma](../guides/karma.md).


### Switching between node versions

Some times you may need to switch between different versions of node, you can use a CLI tool called
`nvm` to quickly switch between node versions.

To install NVM:

```bash
brew install nvm
nvm install 4
```

Now your machine will be running Node 4. You can use the `nvm use` command to switch between the two
environments:

```bash
nvm use 0.12
```

```bash
nvm use 4
```



## Example Projects

- [enzyme-example-mocha](https://github.com/lelandrichardson/enzyme-example-mocha)
