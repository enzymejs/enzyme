import React from 'react';
import TestUtils from 'react-addons-test-utils';

class Renderer {
  render(element) {
    this.rendered = TestUtils.renderIntoDocument(element);
    console.log(rendered);
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
