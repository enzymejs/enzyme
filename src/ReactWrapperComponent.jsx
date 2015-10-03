import React, { PropTypes } from 'react'

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

  render() {
    const { Component } = this.props;
    return (
      <Component ref="component" {...this.state} />
    );
  }
}
