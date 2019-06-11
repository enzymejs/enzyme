import React from 'react';
import { expect } from 'chai';

import {
  describeIf,
  itIf,
} from '../../_helpers';

import {
  useContext,
  useState,
  createContext,
} from '../../_helpers/react-compat';

export default function describeUseContext({
  hasHooks,
  Wrap,
  isShallow,
}) {
  describeIf(hasHooks, 'hooks: useContext', () => {
    describe('simple example', () => {
      const initialTitle = 'initialTitle';
      const TitleContext = createContext && createContext(initialTitle);

      function UiComponent() {
        const title = useContext(TitleContext);
        return (
          <div>
            {title}
          </div>
        );
      }

      const customTitle = 'CustomTitle';

      function App() {
        return (
          <TitleContext.Provider value={customTitle}>
            <UiComponent />
          </TitleContext.Provider>
        );
      }

      it('render ui component with initial context value', () => {
        const wrapper = Wrap(<UiComponent />);
        expect(wrapper.text()).to.equal(initialTitle);
      });

      // TODO: useContext: enable when shallow dive supports createContext
      itIf(!isShallow, 'render ui component with value from outer provider', () => {
        const wrapper = Wrap(<App />);
        const subWrapper = isShallow ? wrapper.dive().dive() : wrapper;
        expect(subWrapper.text()).to.equal(customTitle);
      });
    });

    // TODO: useContext: enable when shallow dive supports createContext
    describeIf(!isShallow, 'useContext: with Setting', () => {
      const initialState = 10;
      const context = createContext && createContext(null);

      function MyGrandChild() {
        const myContextVal = useContext(context);

        const increment = () => {
          myContextVal.setState(myContextVal.state + 1);
        };

        return (
          <div>
            <button type="button" onClick={increment}>increment</button>
            <span className="grandChildState">
              {myContextVal.state}
            </span>
          </div>
        );
      }

      function MyChild() {
        return (
          <div>
            <MyGrandChild />
          </div>
        );
      }

      function App() {
        const [state, setState] = useState(initialState);

        return (
          <context.Provider value={{ state, setState }}>
            <div>
              <MyChild />
            </div>
          </context.Provider>
        );
      }

      it('test render, get and set context value ', () => {
        const wrapper = Wrap(<App />);

        function getChild() {
          const child = wrapper.find(MyChild);
          return isShallow ? child.dive() : child;
        }
        function getGrandChild() {
          const grandchild = getChild().find(MyGrandChild);
          return isShallow ? grandchild.dive() : grandchild;
        }
        expect(getGrandChild().find('.grandChildState').debug()).to.equal(`<span className="grandChildState">
  ${String(initialState)}
</span>`);

        getGrandChild().find('button').props().onClick();
        wrapper.update();
        expect(getGrandChild().find('.grandChildState').debug()).to.equal(`<span className="grandChildState">
  ${String(initialState + 1)}
</span>`);
      });
    });
  });
}
