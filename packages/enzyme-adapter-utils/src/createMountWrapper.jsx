import React from 'react';
import PropTypes from 'prop-types';
import { ref } from 'airbnb-prop-types';
import RootFinder from './RootFinder';

/* eslint react/forbid-prop-types: 0 */

const stringOrFunction = PropTypes.oneOfType([PropTypes.func, PropTypes.string]);
const makeValidElementType = (adapter) => {
  if (!adapter) {
    return stringOrFunction;
  }

  function validElementTypeRequired(props, propName, ...args) {
    if (!adapter.isValidElementType) {
      return stringOrFunction.isRequired(props, propName, ...args);
    }
    const propValue = props[propName]; // eslint-disable-line react/destructuring-assignment
    if (adapter.isValidElementType(propValue)) {
      return null;
    }
    return new TypeError(`${propName} must be a valid element type!`);
  }

  function validElementType(props, propName, ...args) {
    const propValue = props[propName];
    if (propValue == null) {
      return null;
    }
    return validElementTypeRequired(props, propName, ...args);
  }
  validElementType.isRequired = validElementTypeRequired;

  return validElementType;
};

/**
 * This is a utility component to wrap around the nodes we are
 * passing in to `mount()`. Theoretically, you could do everything
 * we are doing without this, but this makes it easier since
 * `renderIntoDocument()` doesn't really pass back a reference to
 * the DOM node it rendered to, so we can't really "re-render" to
 * pass new props in.
 */
export default function createMountWrapper(node, options = {}) {
  const { adapter, wrappingComponent: WrappingComponent } = options;

  class WrapperComponent extends React.Component {
    constructor(...args) {
      super(...args);
      const { props, wrappingComponentProps, context } = this.props;
      this.state = {
        mount: true,
        props,
        wrappingComponentProps,
        context,
      };
    }

    // eslint-disable-next-line react/no-unused-class-component-methods
    setChildProps(newProps, newContext, callback = undefined) {
      const { props: oldProps, context: oldContext } = this.state;
      const props = { ...oldProps, ...newProps };
      const context = { ...oldContext, ...newContext };
      this.setState({ props, context }, callback);
    }

    // eslint-disable-next-line react/no-unused-class-component-methods
    setWrappingComponentProps(props, callback = undefined) {
      this.setState({ wrappingComponentProps: props }, callback);
    }

    render() {
      const { Component, forwardedRef } = this.props;
      const { mount, props, wrappingComponentProps } = this.state;
      if (!mount) return null;
      // eslint-disable-next-line react/jsx-props-no-spreading
      const component = <Component ref={forwardedRef} {...props} />;
      if (WrappingComponent) {
        return (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <WrappingComponent {...wrappingComponentProps}>
            <RootFinder>{component}</RootFinder>
          </WrappingComponent>
        );
      }
      return component;
    }
  }
  WrapperComponent.supportsForwardedRef = true;
  WrapperComponent.propTypes = {
    Component: makeValidElementType(adapter).isRequired,
    refProp: PropTypes.oneOfType([PropTypes.string, ref()]),
    props: PropTypes.object.isRequired,
    wrappingComponentProps: PropTypes.object,
    context: PropTypes.object,
    forwardedRef: ref(),
  };
  WrapperComponent.defaultProps = {
    refProp: null,
    context: null,
    wrappingComponentProps: null,
    forwardedRef: undefined,
  };

  if (options.context && (node.type.contextTypes || options.childContextTypes)) {
    // For full rendering, we are using this wrapper component to provide context if it is
    // specified in both the options AND the child component defines `contextTypes` statically
    // OR the merged context types for all children (the node component or deeper children) are
    // specified in options parameter under childContextTypes.
    // In that case, we define both a `getChildContext()` function and a `childContextTypes` prop.
    const childContextTypes = {
      ...node.type.contextTypes,
      ...options.childContextTypes,
    };

    WrapperComponent.prototype.getChildContext = function getChildContext() {
      return this.state.context;
    };
    WrapperComponent.childContextTypes = childContextTypes;
  }
  return WrapperComponent;
}
