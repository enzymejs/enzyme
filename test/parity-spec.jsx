import React from 'react';
import { expect } from 'chai';
import { describeWithDOM } from './_helpers';
import { mount, shallow } from '../src/';

const renderers = [shallow, mount];

describeWithDOM('shallow-mount parity', () => {
  describe('simulate(event, mock)', () => {
    it('should propagate events', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div
              onChange={() => this.props.calls.push('onChange')}
              onClick={() => this.props.calls.push('div bubble')}
              onClickCapture={() => this.props.calls.push('div capture')}
            >
              <span
                onClick={() => this.props.calls.push('span bubble')}
                onClickCapture={() => this.props.calls.push('span capture')}
              >
                <a
                  onClick={() => this.props.calls.push('a bubble')}
                  onClickCapture={() => this.props.calls.push('a capture')}
                >
                  foo
                </a>
              </span>
            </div>
          );
        }
      }

      renderers.forEach((renderer) => {
        const actualCalls = [];
        const wrapper = renderer(<Foo calls={actualCalls} />);

        wrapper.find('a').simulate('click');
        expect(actualCalls.length).to.equal(6);
        expect(actualCalls).to.eql([
          'div capture',
          'span capture',
          'a capture',
          'a bubble',
          'span bubble',
          'div bubble',
        ]);
      });
    });
  });
});
