import React from 'react';
import { expect } from 'chai';
import {
  useJsDom,
  mount,
  simulate,
  spySetup,
  spyTearDown,
  spyLifecycle,
  spyMethods,
  sinon,
  isComponentWithType,
} from '../';

describe('mount', () => {
  useJsDom();

  beforeEach(spySetup);
  afterEach(spyTearDown);

  it('should mount a JSX Tree with a normal dom element', () => {
    const wrapper = mount(
      <div/>
    );
  });

  it('should mount a JSX Tree with a composite element', () => {
    class Foo extends React.Component {
      render() {
        return <div/>
      }
    }

    const wrapper = mount(
      <Foo />
    );

  });

  it('should call componentDidMount', () => {
    class Foo extends React.Component {
      componentDidMount() {

      }
      render() {
        return <div/>
      }
    }
    spyLifecycle(Foo);
    const wrapper = mount(
      <Foo />
    );
    expect(Foo.prototype.componentDidMount.calledOnce).to.be.true;
  });

  describe('setProps', () => {
    class Foo extends React.Component {
      render() {
        return <input value={this.props.value} onChange={this.props.onChange} />
      }
    }

    it('should be able to set props', () => {
      const spy = sinon.spy();
      const wrapper = mount(<Foo value={"foo"} onChange={spy} />);
      expect(wrapper.find('input').value).to.equal("foo");
      wrapper.setProps({
        value: "bar"
      });
      expect(wrapper.find('input').value).to.equal("bar");
    });
  });

  describe('ref', () => {

    class Foo extends React.Component {
      render() {
        return <div ref="ref" />
      }
    }

    it('should find the ref by name', () => {
      const wrapper = mount(<Foo />);
      var ref = wrapper.ref('ref');
      expect(ref).to.be.defined;
    });

  });

  describe('findWhere', () => {
    it('should find a single element', () => {
      const wrapper = mount(
        <div>
          <input />
        </div>
      );
      expect(wrapper.find('input'))
    });
  });

  describe('find', () => {
    it('should return a single element', () => {
      const wrapper = mount(
        <div>
          <input />
        </div>
      );
      expect(wrapper.find('input')).to.be.instanceOf(HTMLInputElement);
    });

    it('should accept a tag name as a selector', () => {
      const wrapper = mount(
        <div>
          <input />
        </div>
      );
      expect(wrapper.find('input')).to.be.instanceOf(HTMLInputElement);
    });

    it('should accept a class name as a selector', () => {
      const wrapper = mount(
        <div>
          <button className="foo" />
        </div>
      );
      expect(wrapper.find('.foo')).to.be.instanceOf(HTMLButtonElement);
    });

    it('should accept a component constructor as a selector', () => {
      class Foo extends React.Component {
        render() { return <div /> }
      }
      const wrapper = mount(
        <div>
          <Foo />
        </div>
      );
      expect(isComponentWithType(wrapper.find(Foo), Foo)).to.be.true;
    });
  });

  describe('findAll', () => {
    it('should return an array of elements', () => {
      const wrapper = mount(
        <div>
          <input />
          <button />
          <button />
        </div>
      );
      const inputs = wrapper.findAll('input');
      const buttons = wrapper.findAll('button');
      expect(inputs).to.be.instanceOf(Array);
      expect(inputs.length).to.equal(1);
      expect(buttons).to.be.instanceOf(Array);
      expect(buttons.length).to.equal(2);
    });

    it('should accept a tag name as a selector', () => {
      const wrapper = mount(
        <div>
          <input />
          <button />
          <button />
        </div>
      );
      const buttons = wrapper.findAll('button');
      expect(buttons).to.be.instanceOf(Array);
      expect(buttons.length).to.equal(2);
    });

    it('should accept a class name as a selector', () => {
      const wrapper = mount(
        <div>
          <button className="foo" />
          <button className="foo" />
        </div>
      );
      expect(wrapper.findAll('.foo').length).to.equal(2);
    });

    it('should accept a component constructor as a selector', () => {
      class Foo extends React.Component {
        render() { return <div /> }
      }
      const wrapper = mount(
        <div>
          <Foo />
          <Foo />
        </div>
      );
      expect(wrapper.findAll(Foo).length).to.equal(2);
    });
  });

});