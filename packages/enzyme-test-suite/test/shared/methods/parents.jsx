import React from 'react';
import { expect } from 'chai';

import {
  itIf,
} from '../../_helpers';

import {
  createClass,
} from '../../_helpers/react-compat';

export default function describeParents({
  Wrap,
  isShallow,
}) {
  describe('.parents([selector])', () => {
    it('returns an array of current node’s ancestors', () => {
      const wrapper = Wrap((
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
          <div className="qux">
            <div className="qoo" />
          </div>
        </div>
      ));

      const parents = wrapper.find('.baz').parents();

      expect(parents).to.have.lengthOf(3);
      expect(parents.at(0).hasClass('bar')).to.equal(true);
      expect(parents.at(1).hasClass('foo')).to.equal(true);
      expect(parents.at(2).hasClass('bax')).to.equal(true);
    });

    it('works for non-leaf nodes as well', () => {
      const wrapper = Wrap((
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      ));

      const parents = wrapper.find('.bar').parents();

      expect(parents).to.have.lengthOf(2);
      expect(parents.at(0).hasClass('foo')).to.equal(true);
      expect(parents.at(1).hasClass('bax')).to.equal(true);
    });

    it('optionally allows a selector', () => {
      const wrapper = Wrap((
        <div className="bax foo">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      ));

      const parents = wrapper.find('.baz').parents('.foo');

      expect(parents).to.have.lengthOf(2);
      expect(parents.at(0).hasClass('foo')).to.equal(true);
      expect(parents.at(1).hasClass('bax')).to.equal(true);
    });

    it('works when called sequentially on two sibling nodes', () => {
      class Test extends React.Component {
        render() {
          return (
            <div>
              <div className="a">
                <div>A child</div>
              </div>
              <div className="b">
                <div>B child</div>
              </div>
            </div>
          );
        }
      }

      const wrapper = Wrap(<Test />);

      const aChild = wrapper.find({ children: 'A child' });
      expect(aChild.debug()).to.equal(`<div>
  A child
</div>`);
      expect(aChild).to.have.lengthOf(1);

      const bChild = wrapper.find({ children: 'B child' });
      expect(bChild.debug()).to.equal(`<div>
  B child
</div>`);
      expect(bChild).to.have.lengthOf(1);

      const bChildParents = bChild.parents('.b');
      expect(bChildParents.debug()).to.equal(`<div className="b">
  <div>
    B child
  </div>
</div>`);
      expect(bChildParents).to.have.lengthOf(1);

      const aChildParents = aChild.parents('.a');
      expect(aChildParents.debug()).to.equal(`<div className="a">
  <div>
    A child
  </div>
</div>`);
      expect(aChildParents).to.have.lengthOf(1);
    });

    itIf(!isShallow, 'works with components in the tree', () => {
      const Foo = createClass({
        render() {
          return <div className="bar" />;
        },
      });
      const wrapper = Wrap((
        <div className="root">
          <Foo />
        </div>
      ));
      const rootDiv = wrapper.find('.root');
      expect(rootDiv).to.have.lengthOf(1);
      expect(rootDiv.hasClass('root')).to.equal(true);
      expect(rootDiv.hasClass('bar')).to.equal(false);

      const bar = rootDiv.find('.bar');
      expect(bar).to.have.lengthOf(1);
      expect(bar.parents('.root')).to.have.lengthOf(1);
    });

    itIf(!isShallow, 'finds parents up a tree through a custom component boundary', () => {
      class CustomForm extends React.Component {
        render() {
          const { children } = this.props;
          return (
            <form>
              {children}
            </form>
          );
        }
      }

      const wrapper = Wrap((
        <div>
          <CustomForm>
            <input />
          </CustomForm>
        </div>
      ));

      const formDown = wrapper.find('form');
      expect(formDown).to.have.lengthOf(1);

      const input = wrapper.find('input');
      expect(input).to.have.lengthOf(1);
      const formUp = input.parents('form');
      expect(formUp).to.have.lengthOf(1);
    });
  });
}
