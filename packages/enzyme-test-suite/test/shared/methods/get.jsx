import React from 'react';
import { expect } from 'chai';

export default function describeGet({
  Wrap,
}) {
  describe('.get(index)', () => {
    it('gets the node at the specified index', () => {
      const wrapper = Wrap((
        <div>
          <div className="bar foo" />
          <div className="bar bax" />
          <div className="bar bux" />
          <div className="bar baz" />
        </div>
      ));
      const bar = wrapper.find('.bar');
      expect(bar.get(0)).to.deep.equal(wrapper.find('.foo').getElement());
      expect(bar.get(1)).to.deep.equal(wrapper.find('.bax').getElement());
      expect(bar.get(2)).to.deep.equal(wrapper.find('.bux').getElement());
      expect(bar.get(3)).to.deep.equal(wrapper.find('.baz').getElement());
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
      expect(wrapper.get(0)).to.have.property('key', null);
    });
  });
}
