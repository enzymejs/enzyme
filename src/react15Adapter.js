import React from 'react';

const TestUtils = require('react-addons-test-utils');

class Renderer {
  render(element) {
    this.rendered = TestUtils.renderIntoDocument(element);
    return this.rendered;
  }
}

const adapter = {
  getTargetApiVersion() {
    return React.Version;
  },

  createRenderer(options) {
    this.options = options;
    return new Renderer();
  },

  nodeToElement() {
    return null;
  },
};

export default adapter;
