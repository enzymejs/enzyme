import React from 'react';
import sinon from 'sinon-sandbox';
import { expect } from 'chai';

import {
  describeIf,
} from '../../_helpers';
import {
  is,
} from '../../_helpers/version';

export default function describeGSBU({
  Wrap,
}) {
  describeIf(is('>= 16.3'), 'getSnapshotBeforeUpdate()', () => {
    it('calls getSnapshotBeforeUpdate and pass snapshot to componentDidUpdate', () => {
      const spy = sinon.spy();
      spy(1);

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            foo: 'bar',
          };
        }

        componentDidUpdate(prevProps, prevState, snapshot) {
          spy('componentDidUpdate', prevProps, this.props, prevState, this.state, snapshot);
        }

        getSnapshotBeforeUpdate(prevProps, prevState) {
          spy('getSnapshotBeforeUpdate', prevProps, this.props, prevState, this.state);
          return { snapshot: 'ok' };
        }

        render() {
          spy('render');
          return <div>foo</div>;
        }
      }
      const wrapper = Wrap(<Foo name="foo" />);
      spy(1);
      expect(spy.args).to.deep.equal([
        [1],
        ['render'],
        [1],
      ]);
      spy.resetHistory();
      spy(2);

      wrapper.setProps({ name: 'bar' });
      spy(2);
      expect(spy.args).to.deep.equal([
        [2],
        ['render'],
        ['getSnapshotBeforeUpdate', { name: 'foo' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'bar' }],
        ['componentDidUpdate', { name: 'foo' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'bar' }, { snapshot: 'ok' }],
        [2],
      ]);
      spy.resetHistory();
      spy(3);

      wrapper.setState({ foo: 'baz' });
      spy(3);
      expect(spy.args).to.deep.equal([
        [3],
        ['render'],
        ['getSnapshotBeforeUpdate', { name: 'bar' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'baz' }],
        ['componentDidUpdate', { name: 'bar' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'baz' }, { snapshot: 'ok' }],
        [3],
      ]);
    });
  });
}
