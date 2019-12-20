import React from 'react';
import { expect } from 'chai';

import { describeIf } from '../../_helpers';

import { useReducer } from '../../_helpers/react-compat';

export default function describeUseReducer({
  hasHooks,
  Wrap,
}) {
  describeIf(hasHooks, 'hooks: useReducer', () => {
    describe('with custom dispatch', () => {
      const initialState = [];

      function Child({ dispatch, text }) {
        function fire() {
          dispatch({
            type: 'ADD_TEXT',
            payload: text,
          });
        }

        return <button type="button" onClick={fire}>Add {text}</button>;
      }

      function reducer(state, action) {
        switch (action.type) {
          case 'ADD_TEXT':
            return [...state, action.payload];
          default:
            throw new Error();
        }
      }

      function FooBarTextList() {
        const [state, dispatch] = useReducer(reducer, initialState);

        return (
          <div className="FooBarTextList">
            <Child text="foo" dispatch={dispatch} />
            <Child text="bar" dispatch={dispatch} />
            {state.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        );
      }

      it('render with initial state from useReducer', () => {
        const wrapper = Wrap(<FooBarTextList />);
        expect(wrapper.find('p')).to.have.lengthOf(0);
      });

      it('Test with Add Foo & Bar tex', () => {
        const wrapper = Wrap(<FooBarTextList />);
        expect(wrapper.find('p')).to.have.lengthOf(0);
        wrapper.find('Child').at(0).props().dispatch({
          type: 'ADD_TEXT',
          payload: 'foo',
        });
        wrapper.update();

        expect(wrapper.find('p')).to.have.lengthOf(1);
        expect(wrapper.find('p').at(0).text()).to.equal('foo');

        wrapper.find('Child').at(1).props().dispatch({
          type: 'ADD_TEXT',
          payload: 'bar',
        });
        wrapper.update();
        expect(wrapper.find('p')).to.have.length(2);
        expect(wrapper.find('p').at(0).text()).to.equal('foo');
        expect(wrapper.find('p').at(1).text()).to.equal('bar');
      });
    });
  });
}
