import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import {
  is,
} from '../../_helpers/version';

export default function describeGetWrappingComponent({
  Wrap,
  WrapperName,
  isShallow,
}) {
  class RendersNull extends React.Component {
    render() {
      return null;
    }
  }
  class StateTester extends React.Component {
    render() {
      return null;
    }
  }
  class RendersChildren extends React.Component {
    render() {
      const { children } = this.props;
      return children;
    }
  }

  describeIf(is('<= 0.13'), '<= 0.13: .getWrappingComponent()', () => {
    it('throws', () => {
      expect(() => Wrap(<div />, {
        wrappingComponent: RendersChildren,
      })).to.throw(TypeError, 'your adapter does not support `wrappingComponent`. Try upgrading it!');
    });
  });

  describeIf(is('> 0.13'), '> 0.13: .getWrappingComponent()', () => {
    class TestProvider extends React.Component {
      getChildContext() {
        const { value, renderMore, renderStateTester } = this.props;

        return {
          testContext: value || 'Hello world!',
          renderMore: !!renderMore,
          renderStateTester: !!renderStateTester,
        };
      }

      render() {
        const { children } = this.props;
        return children;
      }
    }
    TestProvider.childContextTypes = {
      testContext: PropTypes.string,
      renderMore: PropTypes.bool,
      renderStateTester: PropTypes.bool,
    };

    class MyWrappingComponent extends React.Component {
      constructor() {
        super();
        this.state = { renderStateTester: false };
      }

      render() {
        const { children, contextValue, renderMore } = this.props;
        const { renderStateTester } = this.state;

        return (
          <main>
            <TestProvider
              value={contextValue}
              renderMore={renderMore}
              renderStateTester={renderStateTester}
            >
              {children}
            </TestProvider>
          </main>
        );
      }
    }

    class MyComponent extends React.Component {
      render() {
        const {
          testContext,
          renderMore,
          renderStateTester,
          explicitContext,
        } = this.context;

        return (
          <div>
            <div>Context says: {testContext}{explicitContext}</div>
            {renderMore && <RendersNull />}
            {renderStateTester && <StateTester />}
          </div>
        );
      }
    }
    MyComponent.contextTypes = {
      ...TestProvider.childContextTypes,
      explicitContext: PropTypes.string,
    };

    const context = {
      explicitContext: ' stop!',
    };

    it('gets a Wrapper for the wrappingComponent', () => {
      const wrapper = Wrap(<MyComponent />, {
        wrappingComponent: MyWrappingComponent,
        context,
      });
      const wrappingComponent = wrapper.getWrappingComponent();
      expect(wrappingComponent.type()).to.equal(isShallow ? 'main' : MyWrappingComponent);
      expect(wrappingComponent.parent().exists()).to.equal(false);

      wrappingComponent.setProps({ contextValue: 'this is a test.' });
      expect(wrapper.text()).to.equal('Context says: this is a test. stop!');
    });

    it('updates the wrapper when the wrappingComponent is updated', () => {
      const wrapper = Wrap(<MyComponent />, {
        wrappingComponent: MyWrappingComponent,
        context,
      });
      const wrappingComponent = wrapper.getWrappingComponent();
      wrappingComponent.setProps({ renderMore: true });
      expect(wrapper.find(RendersNull).exists()).to.equal(true);
      expect(wrapper.text()).to.equal(`Context says: Hello world! stop!${isShallow ? '<RendersNull />' : ''}`);
    });

    it('updates the primary wrapper after a state update', () => {
      const wrapper = Wrap(<MyComponent />, {
        wrappingComponent: MyWrappingComponent,
        context: {
          explicitContext: ' stop!',
        },
      });
      const wrappingComponent = wrapper.getWrappingComponent();
      wrappingComponent.setState({ renderStateTester: true });
      expect(wrapper.find(StateTester).exists()).to.equal(true);
      expect(wrapper.text()).to.equal(`Context says: Hello world! stop!${isShallow ? '<StateTester />' : ''}`);
    });

    it('updates the wrappingComponent when the root is updated', () => {
      const wrapper = Wrap(<MyComponent />, {
        wrappingComponent: MyWrappingComponent,
        context,
      });
      const wrappingComponent = wrapper.getWrappingComponent();
      wrapper.unmount();
      expect(wrappingComponent.children()).to.have.lengthOf(0);
      if (!isShallow) {
        expect(wrappingComponent.exists()).to.equal(false);
      }
    });

    it('handles the wrapper being unmounted', () => {
      const wrapper = Wrap(<MyComponent />, {
        wrappingComponent: MyWrappingComponent,
        context,
      });
      const wrappingComponent = wrapper.getWrappingComponent();
      wrapper.unmount();
      wrappingComponent.update();
      expect(wrappingComponent.children()).to.have.lengthOf(0);
      if (isShallow) {
        expect(wrappingComponent.debug()).to.equal('');
      } else {
        expect(wrappingComponent.exists()).to.equal(false);
        expect(() => wrappingComponent.setProps({})).to.throw(
          'The wrapping component may not be updated if the root is unmounted.',
        );
      }
    });

    itIf(is('>= 16.3'), 'updates a <Provider /> if it is rendered as root', () => {
      const Context = React.createContext();
      function WrappingComponent(props) {
        const { value, children } = props;
        return (
          <Context.Provider value={value}>
            {children}
          </Context.Provider>
        );
      }
      const wrapper = Wrap((
        <Context.Consumer>
          {(value) => <div>{value}</div>}
        </Context.Consumer>
      ), {
        wrappingComponent: WrappingComponent,
        wrappingComponentProps: { value: 'hello!' },
      });
      const wrappingComponent = wrapper.getWrappingComponent();
      expect(wrapper.text()).to.equal('hello!');

      wrappingComponent.setProps({ value: 'goodbye!' });
      expect(wrapper.text()).to.equal('goodbye!');
    });

    itIf(!isShallow, 'handles a partial prop update', () => {
      const wrapper = Wrap(<MyComponent />, {
        wrappingComponent: MyWrappingComponent,
        context,
      });
      const wrappingComponent = wrapper.getWrappingComponent();
      wrappingComponent.setProps({ contextValue: 'hello' });
      wrappingComponent.setProps({ foo: 'bar' });
      expect(wrappingComponent.prop('foo')).to.equal('bar');
      expect(wrappingComponent.prop('contextValue')).to.equal('hello');
    });

    it('cannot be called on the non-root', () => {
      const wrapper = Wrap(<MyComponent />, {
        wrappingComponent: MyWrappingComponent,
        context,
      });
      expect(() => wrapper.find('div').getWrappingComponent()).to.throw(
        `${WrapperName}::getWrappingComponent() can only be called on the root`,
      );
    });

    it('cannot be called on itself', () => {
      const wrapper = Wrap(<MyComponent />, {
        wrappingComponent: MyWrappingComponent,
        context,
      });
      const wrappingComponent = wrapper.getWrappingComponent();
      expect(() => wrappingComponent.getWrappingComponent()).to.throw(
        `${WrapperName}::getWrappingComponent() can only be called on the root`,
      );
    });

    it('throws an error if `wrappingComponent` was not provided', () => {
      const wrapper = Wrap(<MyComponent />);
      expect(() => wrapper.getWrappingComponent()).to.throw(
        `${WrapperName}::getWrappingComponent() can only be called on a wrapper that was originally passed a \`wrappingComponent\` option`,
      );
    });
  });
}
