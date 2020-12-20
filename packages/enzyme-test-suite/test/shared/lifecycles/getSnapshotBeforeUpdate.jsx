import React from 'react';

import {
  describeIf,
  argSpy,
  expectArgs,
} from '../../_helpers';
import {
  is,
} from '../../_helpers/version';

export default function describeGSBU({
  Wrap,
}) {
  describeIf(is('>= 16.3'), 'getSnapshotBeforeUpdate()', () => {
    it('calls getSnapshotBeforeUpdate and pass snapshot to componentDidUpdate', () => {
      const spy = argSpy();

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
      expectArgs(spy, 1, [
        ['render'],
      ]);

      wrapper.setProps({ name: 'bar' });
      expectArgs(spy, 2, [
        ['render'],
        ['getSnapshotBeforeUpdate', { name: 'foo' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'bar' }],
        ['componentDidUpdate', { name: 'foo' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'bar' }, { snapshot: 'ok' }],
      ]);

      wrapper.setState({ foo: 'baz' });
      expectArgs(spy, 3, [
        ['render'],
        ['getSnapshotBeforeUpdate', { name: 'bar' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'baz' }],
        ['componentDidUpdate', { name: 'bar' }, { name: 'bar' }, { foo: 'bar' }, { foo: 'baz' }, { snapshot: 'ok' }],
      ]);
    });
  });
}
