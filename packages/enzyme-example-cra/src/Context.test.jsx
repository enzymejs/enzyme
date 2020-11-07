import React from 'react';
import { mount } from 'enzyme';

const initial = <main />;
const Context = React.createContext(initial);
const { Consumer, Provider } = Context;

class Component extends React.Component {
  static contextType = Context;

  render() {
    return this.context || null;
  }
}

function SFC() {
  return <Consumer>{(value) => value}</Consumer>;
}

/*
function WithHook() {
  const context = React.useContext(Context);
  return context || null;
}

describe('shallow', () => {
});
*/

describe('mount', () => {
  [
    [Component, 'a class component'],
    [SFC, 'an SFC using Consumer'],
    // [WithHook, 'an SFC with useContext hook'],
  ].forEach(([C, desc]) => {
    it(`works with ${desc}`, () => {
      const wrapper = mount(<C />);

      expect(wrapper.debug()).toEqual(`<${C.name}>
  <main />
</${C.name}>`);
    });

    it(`works with ${desc} with an inline Provider`, () => {
      const wrapper = mount(<Provider><C /></Provider>);

      expect(wrapper.debug()).toEqual(`<${C.name} />`);
    });

    it(`works with ${desc} with an inline Provider with a value`, () => {
      const wrapper = mount(<Provider value={<aside />}><C /></Provider>);

      expect(wrapper.debug()).toEqual(`<${C.name}>
  <aside />
</${C.name}>`);

      wrapper.setProps({ value: <span /> });

      expect(wrapper.debug()).toEqual(`<${C.name}>
  <span />
</${C.name}>`);
    });

    it(`works with ${desc} with a wrappingComponent Provider`, () => {
      const wrapper = mount(<C />, {
        wrappingComponent: Provider,
      });

      expect(wrapper.debug()).toEqual(`<${C.name} />`);
    });

    it(`works with ${desc} with a wrappingComponent Provider with a value`, () => {
      const wrapper = mount(<C />, {
        wrappingComponent: Provider,
        wrappingComponentProps: { value: <nav /> },
      });

      expect(wrapper.debug()).toEqual(`<${C.name}>
  <nav />
</${C.name}>`);
    });
  });
});
