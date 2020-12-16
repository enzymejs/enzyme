import React from 'react';
import sinon from 'sinon-sandbox';
import { expect } from 'chai';

export default function describeCWU({
  Wrap,
}) {
  describe('componentWillUnmount', () => {
    it('calls componentWillUnmount', () => {
      const spy = sinon.spy();
      class Foo extends React.Component {
        componentWillUnmount() {
          spy('componentWillUnmount');
        }

        render() {
          spy('render');
          return <div>foo</div>;
        }
      }
      const wrapper = Wrap(<Foo />);
      wrapper.unmount();
      expect(spy.args).to.deep.equal([
        ['render'],
        ['componentWillUnmount'],
      ]);
    });
  });
}
