import React from 'react';

const adapter = {
  getTargetApiVersion() {
    return React.Version;
  },

  createRenderer(options) {
    this.options = options;
    return {};
  },

  nodeToElement() {
    return null;
  },
};

export default adapter;
