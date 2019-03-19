import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

export default function describeMatchesElement({
  Wrap,
  WrapRendered,
}) {
  describe('.matchesElement(node)', () => {
    it('matches on a root node that looks like the rendered one', () => {
      const spy = sinon.spy();
      const wrapper = Wrap((
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      )).first();
      expect(wrapper.matchesElement(<div><div>Hello World</div></div>)).to.equal(true);
      expect(wrapper.matchesElement((
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      ))).to.equal(true);
      expect(wrapper.matchesElement((
        <div>
          <div onClick={spy}>Hello World</div>
        </div>
      ))).to.equal(true);
      expect(wrapper.matchesElement((
        <div>
          <div style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      ))).to.equal(true);
      expect(spy).to.have.property('callCount', 0);
    });

    it('does not match on a root node that doesn’t looks like the rendered one', () => {
      const spy = sinon.spy();
      const spy2 = sinon.spy();
      const wrapper = Wrap((
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'red' }}>Hello World</div>
        </div>
      )).first();
      expect(wrapper.matchesElement(<div><div>Bonjour le monde</div></div>)).to.equal(false);
      expect(wrapper.matchesElement((
        <div>
          <div onClick={spy} style={{ fontSize: 12, color: 'blue' }}>Hello World</div>
        </div>
      ))).to.equal(false);
      expect(wrapper.matchesElement((
        <div>
          <div onClick={spy2}>Hello World</div>
        </div>
      ))).to.equal(false);
      expect(wrapper.matchesElement((
        <div>
          <div style={{ fontSize: 13, color: 'red' }}>Hello World</div>
        </div>
      ))).to.equal(false);
      expect(spy).to.have.property('callCount', 0);
      expect(spy2).to.have.property('callCount', 0);
    });

    it('matches a simple node', () => {
      class Test extends React.Component {
        render() {
          return <h1>test</h1>;
        }
      }
      const wrapper = WrapRendered(<Test />);
      expect(wrapper.matchesElement(<h1>test</h1>)).to.equal(true);
    });
  });
}
