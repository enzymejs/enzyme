import React from 'react';
import { expect } from 'chai';

import { debugNodes } from 'enzyme/build/Debug';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  createClass,
  memo,
  useCallback,
} from '../../_helpers/react-compat';

export default function describeDebug({
  Wrap,
  WrapRendered,
  isShallow,
}) {
  describe('.debug()', () => {
    context('passes through to the debugNodes function', () => {
      it('with wrapping an HTML element', () => {
        const wrapper = Wrap(<div />);

        expect(wrapper.debug()).to.equal('<div />');
        expect(wrapper.debug()).to.equal(debugNodes(wrapper.getNodesInternal()));
      });

      it('with wrapping a createClass component', () => {
        const Foo = createClass({
          displayName: 'Bar',
          render() { return <div />; },
        });
        const wrapper = Wrap(<Foo />);

        const expectedDebug = isShallow
          ? '<div />'
          : `<Bar>
  <div />
</Bar>`;
        expect(wrapper.debug()).to.equal(expectedDebug);
        expect(wrapper.debug()).to.equal(debugNodes(wrapper.getNodesInternal()));
      });

      it('with wrapping a class component', () => {
        class Foo extends React.Component {
          render() {
            return <div />;
          }
        }
        const wrapper = Wrap(<Foo />);

        const expectedDebug = isShallow
          ? '<div />'
          : `<Foo>
  <div />
</Foo>`;
        expect(wrapper.debug()).to.equal(expectedDebug);
        expect(wrapper.debug()).to.equal(debugNodes(wrapper.getNodesInternal()));
      });

      itIf(is('> 0.13'), 'with wrapping a stateless function component (SFC)', () => {
        const wrapper = Wrap(<div />);

        expect(wrapper.debug()).to.equal('<div />');
        expect(wrapper.debug()).to.equal(debugNodes(wrapper.getNodesInternal()));
      });
    });

    describeIf(is('>= 16.6'), 'React.memo', () => {
      describe('display names', () => {
        function SFC() { return null; }
        function SFCwithDisplayName() { return null; }
        SFCwithDisplayName.displayName = 'SFC!';

        const SFCMemo = memo && memo(SFC);
        const SFCwithDisplayNameMemo = memo && memo(SFCwithDisplayName);

        const SFCMemoWithDisplayName = memo && Object.assign(memo(SFC), {
          displayName: 'SFCMemoWithDisplayName!',
        });
        const SFCMemoWitDoubleDisplayName = memo && Object.assign(memo(SFCwithDisplayName), {
          displayName: 'SFCMemoWitDoubleDisplayName!',
        });

        it('displays the expected display names', () => {
          const wrapper = Wrap((
            <div>
              <SFC />
              <SFCwithDisplayName />
              <SFCMemo />
              <SFCwithDisplayNameMemo />
              <SFCMemoWithDisplayName />
              <SFCMemoWitDoubleDisplayName />
            </div>
          ));
          expect(wrapper.debug()).to.equal(`<div>
  <SFC />
  <SFC! />
  <Memo(SFC) />
  <Memo(SFC!) />
  <SFCMemoWithDisplayName! />
  <SFCMemoWitDoubleDisplayName! />
</div>`);
        });
      });

      describe('defaultProps', () => {
        function Add({ a, b, c }) {
          return <div>{String(a)}|{String(b)}|{String(c)}</div>;
        }
        Add.defaultProps = {
          b: 2,
          c: 3,
        };
        const MemoAdd = memo && memo(Add);

        it('applies defaultProps to the component', () => {
          const wrapper = WrapRendered(<Add />);
          expect(wrapper.debug()).to.equal(`<div>
  undefined
  |
  2
  |
  3
</div>`);
        });

        it('applies defaultProps to the memoized component', () => {
          const wrapper = WrapRendered(<MemoAdd />);
          expect(wrapper.debug()).to.equal(`<div>
  undefined
  |
  2
  |
  3
</div>`);
        });

        it('applies defaultProps to the memoized component and does not override real props', () => {
          const wrapper = WrapRendered(<MemoAdd a={10} b={20} />);
          expect(wrapper.debug()).to.equal(`<div>
  10
  |
  20
  |
  3
</div>`);
        });

        describeIf(is('>= 16.8'), 'full tree', () => {
          function TransitionGroup({ children }) { return children; }
          function CSSTransition({ children }) { return children; }
          function Body({ imageToShow, switchImage }) {
            const handlerClick = useCallback(
              () => {
                if (imageToShow === 1) {
                  return switchImage(2);
                }

                return switchImage(1);
              },
              [imageToShow, switchImage],
            );

            return (
              <div className="styles.body">
                <button type="button" onClick={handlerClick} className="buttonsStyles.button">
                  <TransitionGroup className="body.animWrap">
                    <CSSTransition classNames="mainImage" timeout={500} key={imageToShow}>
                      <img className="bodyImg" src={`../assets/${imageToShow}.png`} alt="main_img" />
                    </CSSTransition>
                  </TransitionGroup>
                </button>
              </div>
            );
          }
          const BodyMemo = memo && memo(Body);

          it('shows everything when not memoized', () => {
            const wrapper = WrapRendered(<Body imageToShow={1} switchImage={() => {}} />);
            expect(wrapper.debug()).to.equal(`<div className="styles.body">
  <button type="button" onClick={[Function]} className="buttonsStyles.button">
    <TransitionGroup className="body.animWrap">
      <CSSTransition classNames="mainImage" timeout={500}>
        <img className="bodyImg" src="../assets/1.png" alt="main_img" />
      </CSSTransition>
    </TransitionGroup>
  </button>
</div>`);
          });

          it('shows everything when memoized', () => {
            const wrapper = WrapRendered(<BodyMemo imageToShow={1} switchImage={() => {}} />);
            expect(wrapper.debug()).to.equal(`<div className="styles.body">
  <button type="button" onClick={[Function]} className="buttonsStyles.button">
    <TransitionGroup className="body.animWrap">
      <CSSTransition classNames="mainImage" timeout={500}>
        <img className="bodyImg" src="../assets/1.png" alt="main_img" />
      </CSSTransition>
    </TransitionGroup>
  </button>
</div>`);
          });
        });
      });
    });
  });
}
