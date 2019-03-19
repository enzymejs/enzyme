import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
  itWithData,
  generateEmptyRenderData,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  createClass,
} from '../../_helpers/react-compat';

export default function describeIsEmptyRender({
  Wrap,
  isShallow,
}) {
  describe('.isEmptyRender()', () => {
    const emptyRenderValues = generateEmptyRenderData();

    itWithData(emptyRenderValues, 'when a React createClass component returns: ', (data) => {
      const Foo = createClass({
        render() {
          return data.value;
        },
      });
      const wrapper = Wrap(<Foo />);
      expect(wrapper.isEmptyRender()).to.equal(data.expectResponse);
    });

    itWithData(emptyRenderValues, 'when an ES2015 class component returns: ', (data) => {
      class Foo extends React.Component {
        render() {
          return data.value;
        }
      }
      const wrapper = Wrap(<Foo />);
      expect(wrapper.isEmptyRender()).to.equal(data.expectResponse);
    });

    describe('nested nodes', () => {
      class RenderChildren extends React.Component {
        render() {
          const { children } = this.props;
          return children;
        }
      }

      class RenderNull extends React.Component {
        render() {
          return null;
        }
      }

      it(`returns ${!isShallow} for nested elements that return null`, () => {
        const wrapper = Wrap((
          <RenderChildren>
            <RenderNull />
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(!isShallow);
      });

      it('returns false for multiple nested elements that all return null', () => {
        const wrapper = Wrap((
          <RenderChildren>
            <div />
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      it('returns false for multiple nested elements where one fringe returns a non null value', () => {
        const wrapper = Wrap((
          <RenderChildren>
            <div>Hello</div>
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      itIf(is('>= 16'), 'returns false for multiple nested elements that all return null', () => {
        const wrapper = Wrap((
          <RenderChildren>
            <RenderNull />
            <RenderChildren>
              <RenderNull />
              <div />
            </RenderChildren>
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      itIf(is('>= 16'), 'returns false for multiple nested elements where one fringe returns a non null value', () => {
        const wrapper = Wrap((
          <RenderChildren>
            <RenderNull />
            <RenderChildren>
              <RenderNull />
              <RenderNull />
            </RenderChildren>
            <RenderChildren>
              <RenderNull />
              <RenderChildren>
                <RenderNull />
                <RenderNull />
                <RenderNull />
                <div>Hello</div>
              </RenderChildren>
            </RenderChildren>
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(false);
      });

      itIf(is('>= 16'), `returns ${!isShallow} for multiple nested elements where all values are null`, () => {
        const wrapper = Wrap((
          <RenderChildren>
            <RenderNull />
            <RenderChildren>
              <RenderNull />
              <RenderNull />
            </RenderChildren>
            <RenderChildren>
              <RenderNull />
              <RenderChildren>
                <RenderNull />
                <RenderNull />
                <RenderNull />
              </RenderChildren>
            </RenderChildren>
          </RenderChildren>
        ));

        expect(wrapper.isEmptyRender()).to.equal(!isShallow);
      });
    });

    it('does not return true for HTML elements', () => {
      const wrapper = Wrap(<div className="bar baz" />);
      expect(wrapper.isEmptyRender()).to.equal(false);
    });

    describeIf(is('>=15 || ^16.0.0-alpha'), 'stateless function components (SFCs)', () => {
      itWithData(emptyRenderValues, 'when a component returns: ', (data) => {
        function Foo() {
          return data.value;
        }
        const wrapper = Wrap(<Foo />);
        expect(wrapper.isEmptyRender()).to.equal(data.expectResponse);
      });
    });
  });
}
