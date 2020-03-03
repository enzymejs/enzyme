import React from 'react';
import { expect } from 'chai';

export default function describeDeprecatedInstanceProperties({
  Wrap,
  isShallow,
}) {
  class Foo extends React.Component {
    render() {
      return (
        <div>
          <span>
            <button type="button" />
          </span>
        </div>
      );
    }
  }

  describe('deprecated instance properties', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = Wrap(<Foo />);
    });

    const tuples = [
      ['node', 'Consider using the getElement() method instead.'],
      ['nodes', 'Consider using the getElements() method instead.'],
      ['renderer', ''],
      ['options', ''],
      ['complexSelector', ''],
    ];

    tuples.forEach(([prop, extra]) => {
      it(`warns on \`${prop}\``, () => {
        expect(() => wrapper[prop]).to.throw(
          Error,
          new RegExp(`^Attempted to access ${isShallow ? 'Shallow' : 'React'}Wrapper::${prop}`),
        );
        expect(() => wrapper[prop]).to.throw(
          Error,
          new RegExp(`${extra.replace(/([(){}.\\])/g, '\\$1')}$`),
        );
      });
    });
  });
}
