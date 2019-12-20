import React from 'react';
import { expect } from 'chai';

import {
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';
import {
  createRef,
} from '../../_helpers/react-compat';

export default function describeGetElement({
  Wrap,
  isShallow,
}) {
  describe('.getElement()', () => {
    it('returns nodes with refs as well', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.setRef = this.setRef.bind(this);
          this.node = null;
        }

        setRef(node) {
          this.node = node;
        }

        render() {
          return (
            <div>
              <div ref={this.setRef} className="foo" />
            </div>
          );
        }
      }
      const wrapper = Wrap(<Foo />);
      const mockNode = { mock: true };
      wrapper.find('.foo').getElement().ref(mockNode);
      expect(wrapper.instance().node).to.equal(mockNode);
    });

    itIf(is('>= 16.3'), 'returns nodes with createRefs as well', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.setRef = createRef();
        }

        render() {
          return (
            <div>
              <div ref={this.setRef} className="foo" />
            </div>
          );
        }
      }
      const wrapper = Wrap(<Foo />);
      // shallow rendering does not invoke refs
      if (isShallow) {
        expect(wrapper.instance().setRef).to.have.property('current', null);
      } else {
        const element = wrapper.find('.foo').instance();
        expect(wrapper.instance().setRef).to.have.property('current', element);
      }
    });

    it('does not add a "null" key to elements with a ref and no key', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.setRef = this.setRef.bind(this);
        }

        setRef(node) {
          this.node = node;
        }

        render() {
          return (
            <div ref={this.setRef} className="foo" />
          );
        }
      }
      const wrapper = Wrap(<Foo />);
      expect(wrapper.getElement()).to.have.property('key', null);
    });

    itIf(is('>= 16.3'), 'does not add a "null" key to elements with a createRef and no key', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.setRef = createRef();
        }

        render() {
          return (
            <div ref={this.setRef} className="foo" />
          );
        }
      }
      const wrapper = Wrap(<Foo />);
      expect(wrapper.getElement()).to.have.property('key', null);
    });
  });
}
