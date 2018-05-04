import { EnzymeAdapter } from 'enzyme';
import { createMountWrapper } from 'enzyme-adapter-utils';
import React from 'react';
import ReactDOM from 'react-dom';

class ReactTestRendererAdapter extends EnzymeAdapter {
  constructor() {
    super();
  }
  createMountRenderer(options) {
    const domNode = options.attachTo || global.document.createElement('div');
    let instance = null;
    return {
      render(el, context, callback) {
        if (instance === null) {
          const ReactWrapperComponent = createMountWrapper(el, options);
          const wrappedEl = React.createElement(ReactWrapperComponent, {
            Component: el.type,
            props: el.props,
            context,
          });
          instance = ReactDOM.render(wrappedEl, domNode);
          if (typeof callback === 'function') {
            callback();
          }
        } else {
          instance.setChildProps(el.props, context, callback);
        }
        return instance;
      },
      unmount() {
        ReactDOM.unmountComponentAtNode(domNode);
        instance = null;
      },
    };
  }
  createRenderer(options) {
    switch (options.mode) {
      case EnzymeAdapter.MODES.MOUNT: return this.createMountRenderer(options);
      default:
        throw new Error(`Enzyme Internal Error: Unrecognized mode: ${options.mode}`);
    }
  }
}

module.exports = ReactTestRendererAdapter;
