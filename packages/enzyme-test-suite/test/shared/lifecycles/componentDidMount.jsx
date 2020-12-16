import React from 'react';
import sinon from 'sinon-sandbox';
import { expect } from 'chai';

export default function describeCDM({
  Wrap,
}) {
  describe('componentDidUpdate()', () => {
    it('does not call `componentDidMount` twice when a child component is created', () => {
      const spy = sinon.spy();

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            foo: 'init',
          };
        }

        componentDidMount() {
          spy('componentDidMount');
        }

        render() {
          spy('render');

          const { foo } = this.state;
          return (
            <div>
              <button type="button" onClick={() => this.setState({ foo: 'update2' })}>
                click
              </button>
              {foo}
            </div>
          );
        }
      }

      const wrapper = Wrap(<Foo />);
      expect(spy.args).to.eql([
        ['render'],
        ['componentDidMount'],
      ]);
      spy.resetHistory();

      wrapper.find('button').prop('onClick')();
      expect(spy).to.have.property('callCount', 1);
    });
  });
}
