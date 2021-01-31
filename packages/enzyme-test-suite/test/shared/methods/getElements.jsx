import React from 'react';
import { expect } from 'chai';
import { itIf } from '../../_helpers';
import { is } from '../../_helpers/version';

export default function describeGetElements({
  Wrap,
}) {
  describe('.getElements()', () => {
    // FIXME: figure out why this fails on 15.0, 15.1, 15.2 and 15.3
    itIf(!is('~15.0 || ~15.1 || ~15.2 || ~15.3'), 'returns the wrapped elements', () => {
      const one = <span />;
      const two = <span />;

      class Test extends React.Component {
        render() {
          return (
            <div>
              {one}
              {two}
            </div>
          );
        }
      }

      const wrapper = Wrap(<Test />);
      expect(wrapper.find('span').getElements()).to.deep.equal([one, two]);
    });
  });
}
