import React from 'react';
import { expect } from 'chai';

import { render } from 'enzyme';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  Fragment,
} from '../../_helpers/react-compat';

export default function describeText({
  Wrap,
  isShallow,
}) {
  describe('.text()', () => {
    const matchesRender = function matchesRender(node) {
      const actual = Wrap(node).text();
      const expected = render(node).text();
      expect(expected).to.equal(actual);
    };

    it('handles simple text nodes', () => {
      const wrapper = Wrap((
        <div>some text</div>
      ));
      expect(wrapper.text()).to.equal('some text');
    });

    it('handles nodes with mapped children', () => {
      class Foo extends React.Component {
        render() {
          const { items } = this.props;
          return (
            <div>
              {items.map(x => x)}
            </div>
          );
        }
      }
      matchesRender(<Foo items={['abc', 'def', 'hij']} />);
      matchesRender((
        <Foo
          items={[
            <i key={1}>abc</i>,
            <i key={2}>def</i>,
            <i key={3}>hij</i>,
          ]}
        />
      ));
    });

    context('composite components', () => {
      class Foo extends React.Component {
        render() { return <div>foo</div>; }
      }

      itIf(isShallow, 'renders dumbly', () => {
        const wrapper = Wrap((
          <div>
            <Foo />
            <div>test</div>
          </div>
        ));
        expect(wrapper.text()).to.equal('<Foo />test');
      });

      itIf(!isShallow, 'renders smartly', () => {
        const wrapper = Wrap((
          <div>
            <Foo />
            <div>test</div>
          </div>
        ));
        expect(wrapper.text()).to.equal('footest');
      });
    });

    it('handles html entities', () => {
      matchesRender(<div>&gt;</div>);
    });

    it('handles spaces the same between shallow and mount', () => {
      const Space = (
        <div>
          <div> test  </div>
          <div>Hello


            World
          </div>
          <div>Hello World</div>
          <div>Hello
            World
          </div>
          <div>Hello     World</div>
          <div>&nbsp;</div>
          <div>&nbsp;&nbsp;</div>
        </div>
      );

      const wrapper = Wrap(Space);

      expect(wrapper.text()).to.equal(' test  Hello WorldHello WorldHello WorldHello     World   ');
    });

    it('handles non-breaking spaces correctly', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              &nbsp; &nbsp;
            </div>
          );
        }
      }
      const wrapper = Wrap(<Foo />);
      const charCodes = wrapper.text().split('').map(x => x.charCodeAt(0));
      expect(charCodes).to.eql([
        0x00a0, // non-breaking space
        0x20, // normal space
        0x00a0, // non-breaking space
      ]);
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('handles nodes with mapped children', () => {
        const Foo = ({ items }) => (
          <div>
            {items.map(x => x)}
          </div>
        );
        matchesRender(<Foo items={['abc', 'def', 'hij']} />);
        matchesRender((
          <Foo
            items={[
              <i key={1}>abc</i>,
              <i key={2}>def</i>,
              <i key={3}>hij</i>,
            ]}
          />
        ));
      });

      const FooSFC = () => (
        <div>foo</div>
      );

      itIf(isShallow, 'renders composite components dumbly', () => {
        const wrapper = Wrap((
          <div>
            <FooSFC />
            <div>test</div>
          </div>
        ));
        expect(wrapper.text()).to.equal('<FooSFC />test');
      });

      itIf(!isShallow, 'renders composite components smartly', () => {
        const wrapper = Wrap((
          <div>
            <FooSFC />
            <div>test</div>
          </div>
        ));
        expect(wrapper.text()).to.equal('footest');
      });
    });

    it('renders falsy numbers', () => {
      [0, -0, '0', NaN].forEach((x) => {
        const wrapper = Wrap(<div>{x}</div>);
        expect(wrapper.text()).to.equal(String(x));
      });
    });

    describe('text content with curly braces', () => {
      it('handles literal strings', () => {
        const wrapper = Wrap(<div><div>{'{}'}</div></div>);
        expect(wrapper.text()).to.equal('{}');
      });

      // FIXME: fix for shallow
      itIf(!isShallow, 'handles innerHTML', () => {
        const wrapper = Wrap((
          <div>
            <div dangerouslySetInnerHTML={{ __html: '{ some text }' }} />
          </div>
        ));
        expect(wrapper.text()).to.equal('{ some text }');
      });
    });

    describeIf(is('> 16.2'), 'fragments', () => {
      class FragmentClassExample extends React.Component {
        render() {
          return (
            <Fragment>
              <div>Foo</div>
              <div>Bar</div>
            </Fragment>
          );
        }
      }

      const FragmentConstExample = () => (
        <Fragment>
          <div><span>Foo</span></div>
          <div><span>Bar</span></div>
        </Fragment>
      );

      it('correctly gets text for both children for class', () => {
        const classWrapper = Wrap(<FragmentClassExample />);
        expect(classWrapper.text()).to.include('Foo');
        expect(classWrapper.text()).to.include('Bar');
      });

      it('correctly gets text for both children for const', () => {
        const constWrapper = Wrap(<FragmentConstExample />);
        expect(constWrapper.text()).to.include('Foo');
        expect(constWrapper.text()).to.include('Bar');
      });

      it('works with a nested component', () => {
        const Title = ({ children }) => <span>{children}</span>;
        const Foobar = () => (
          <Fragment>
            <Title>Foo</Title>
            <Fragment>Bar</Fragment>
          </Fragment>
        );

        const wrapper = Wrap(<Foobar />);
        const text = wrapper.text();
        const expectedDebug = isShallow
          ? `<Fragment>
  <Title>
    Foo
  </Title>
  Bar
</Fragment>`
          : `<Foobar>
  <Title>
    <span>
      Foo
    </span>
  </Title>
  Bar
</Foobar>`;
        expect(wrapper.debug()).to.equal(expectedDebug);
        expect(text).to.equal(isShallow ? '<Title />Bar' : 'FooBar');
      });
    });
  });
}
