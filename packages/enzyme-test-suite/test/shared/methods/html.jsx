import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
} from '../../_helpers';
import { is } from '../../_helpers/version';

import {
  Fragment,
} from '../../_helpers/react-compat';

export default function describeHTML({
  Wrap,
}) {
  describe('.html()', () => {
    it('returns html of straight DOM elements', () => {
      const wrapper = Wrap((
        <div className="test">
          <span>Hello World!</span>
        </div>
      ));
      expect(wrapper.html()).to.equal('<div class="test"><span>Hello World!</span></div>');
    });

    it('renders out nested composite components', () => {
      class Foo extends React.Component {
        render() {
          return (<div className="in-foo" />);
        }
      }
      class Bar extends React.Component {
        render() {
          return (
            <div className="in-bar">
              <Foo />
            </div>
          );
        }
      }
      const wrapper = Wrap(<Bar />);
      expect(wrapper.html()).to.equal('<div class="in-bar"><div class="in-foo"></div></div>');
      expect(wrapper.find(Foo).html()).to.equal('<div class="in-foo"></div>');
    });

    describeIf(is('> 0.13'), 'stateless function components (SFCs)', () => {
      it('renders out nested composite components', () => {
        const Foo = () => <div className="in-foo" />;
        const Bar = () => (
          <div className="in-bar">
            <Foo />
          </div>
        );

        const wrapper = Wrap(<Bar />);
        expect(wrapper.html()).to.equal('<div class="in-bar"><div class="in-foo"></div></div>');
        expect(wrapper.find(Foo).html()).to.equal('<div class="in-foo"></div>');
      });
    });

    describeIf(is('>16.2'), 'Fragments', () => {
      class FragmentClassExample extends React.Component {
        render() {
          return (
            <Fragment>
              <div><span>Foo</span></div>
              <div><span>Bar</span></div>
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

      class ClassChild extends React.Component {
        render() {
          return <div>Class child</div>;
        }
      }

      function SFCChild() {
        return <div>SFC child</div>;
      }

      class FragmentWithCustomChildClass extends React.Component {
        render() {
          return (
            <Fragment>
              <ClassChild />
              <SFCChild />
            </Fragment>
          );
        }
      }

      it('correctly renders html for both children for class', () => {
        const classWrapper = Wrap(<FragmentClassExample />);
        expect(classWrapper.html()).to.equal('<div><span>Foo</span></div><div><span>Bar</span></div>');
      });

      it('correctly renders html for both children for const', () => {
        const constWrapper = Wrap(<FragmentConstExample />);
        expect(constWrapper.html()).to.equal('<div><span>Foo</span></div><div><span>Bar</span></div>');
      });

      it('correctly renders html for custom component children', () => {
        const withChildrenWrapper = Wrap(<FragmentWithCustomChildClass />);
        expect(withChildrenWrapper.html()).to.equal('<div>Class child</div><div>SFC child</div>');
      });
    });
  });
}
