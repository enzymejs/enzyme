import React, { PropTypes } from 'react';

/**
 * This is a utility component to wrap around the nodes we are
 * passing in to `mount()`. Theoretically, you could do everything
 * we are doing without this, but this makes it easier since
 * `renderIntoDocument()` doesn't really pass back a reference to
 * the DOM node it rendered to, so we can't really "re-render" to
 * pass new props in.
 */
export default class ReactWrapperComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = Object.assign({}, props.props);
  }

  setProps(newProps) {
    return new Promise(resolve => this.setState(newProps, resolve));
  }

  getInstance() {
    const component = this._reactInternalInstance._renderedComponent;
    const inst = component.getPublicInstance();
    if (inst === null) {
      throw new Error(
        `You cannot get an instance of a stateless component.`
      );
    }
    return inst;
  }

  getWrappedComponent() {
    const component = this._reactInternalInstance._renderedComponent;
    const inst = component.getPublicInstance();
    if (inst === null) {
      return component;
    }
    return inst;
  }

  render() {
    const { Component } = this.props;
    return (
      <Component {...this.state} />
    );
  }
}
ReactWrapperComponent.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  props: PropTypes.object.isRequired,
};
