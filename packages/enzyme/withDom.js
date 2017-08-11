require('raf/polyfill');

if (!global.document) {
  function initGlobal(document, window) {
    global.document = document;
    global.window = window;
    Object.keys(document.defaultView).forEach((property) => {
      if (typeof global[property] === 'undefined') {
        global[property] = document.defaultView[property];
      }
    });

    global.navigator = {
      userAgent: 'node.js',
    };
  }

  function createV9jsdom(jsdom) {
    const document = jsdom('');
    initGlobal(document, document.defaultView);
  }

  function createV10jsdom(JSDOM) {
    const { window: { document } } = new JSDOM('');
    initGlobal(document, window);
  }

  try {
    const jsdomPackage = require('jsdom');
    const jsdom = jsdomPackage.jsdom;
    const JSDOM = jsdomPackage.JSDOM;

    if(jsdom && typeof jsdom === 'function'){
      createV9jsdom(jsdom);
    } else if (JSDOM && typeof JSDOM === 'function') {
      createV10jsdom(JSDOM);
    }
  } catch (e) {
    // jsdom is not supported...
    if (e.message === "Cannot find module 'jsdom'") {
      console.error('[enzyme/withDom] Error: missing required module "jsdom"');
      console.error('[enzyme/withDom] To fix this you must run:');
      console.error('[enzyme/withDom]   npm install jsdom --save-dev');
    } else {
      console.error('[enzyme withDom] ' + (e.stack || e.message));
    }
  }
}
