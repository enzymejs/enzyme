import React from 'react/addons';
import cheerio from 'cheerio';
import Sinon from 'sinon';
import ReactWrapper from './ReactWrapper';
import ShallowWrapper from './ShallowWrapper';
import { onPrototype } from './Utils';

var jsdom;
try {
  require('jsdom'); // could throw
  jsdom = require('mocha-jsdom');
} catch(e) {
  // jsdom is not supported...
}

const {
  Simulate,
  mockComponent,
  isElement,
  isElementOfType,
  isDOMComponent,
  isCompositeComponent,
  isCompositeComponentWithType,
  } = React.addons.TestUtils;

export const isComponentWithType = isCompositeComponentWithType;

export let sinon = Sinon.sandbox.create();

export const simulate = Simulate;

export function describeWithDom(a, b) {
  describe('<< uses jsdom >>', () => {
    if (typeof jsdom === "function") {
      jsdom();
      describe(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}

export function useSetStateHack() {
  var cleanup = false;
  before(() => {
    if (typeof global.document === 'undefined') {
      cleanup = true;
      global.document = {};
    }
  });
  after(() => {
    if (cleanup) {
      delete global.document;
    }
  });

}

export function useSinon() {
  beforeEach(spySetup);
  afterEach(spyTearDown);
}

export function spySetup() {
  sinon = Sinon.sandbox.create();
}

export function spyTearDown() {
  sinon.restore();
}

export function spyLifecycle(Component) {
  onPrototype(Component, (proto, name) => sinon.spy(proto, name));
}

export function spyMethods(Component) {
  onPrototype(Component, null, (proto, name) => sinon.spy(proto, name));
}

export function spyActions(Actions) {
  // TODO(lmr): implement
  throw new Error("Not Implemented");
}

export function stubActions(Actions) {
  // TODO(lmr): implement
  throw new Error("Not Implemented");
}

export function dispatch(action, payload) {
  // TODO(lmr): implement
  throw new Error("Not Implemented");
}

/**
 * Mounts and renders a react component into the document and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ReactWrapper}
 */
export function mount(node) {
  return new ReactWrapper(node);
}

/**
 * Shallow renders a react component and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ShallowWrapper}
 */
export function shallow(node) {
  return new ShallowWrapper(node);
}

/**
 * Renders a react component into static HTML and provides a cheerio wrapper around it.
 *
 * @param node
 * @returns {*}
 */
export function render(node) {
  const html = React.renderToStaticMarkup(node);
  return cheerio.load(html).root();
}

export { ShallowWrapper as ShallowWrapper };
export { ReactWrapper as ReactWrapper };
