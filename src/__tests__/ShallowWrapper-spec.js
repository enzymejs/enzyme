import React from 'react';
import { expect } from 'chai';
import {
  useJsDom,
  shallow,
  mount,
  simulate,
  spySetup,
  spyTearDown,
  spyLifecycle,
  spyMethods,
  sinon,
  isComponentWithType,
} from '../';


describe('shallow', () => {

  describe('contains', () => {

    it('should allow matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;
      expect(shallow(a).contains(b)).to.be.true;
      expect(shallow(a).contains(c)).to.be.false;
    });

    it('should allow matches on a nested node', () => {
      const wrapper = shallow(
        <div>
          <div className="foo" />
        </div>
      );
      const b = <div className="foo" />;
      expect(wrapper.contains(b)).to.be.true;
    });

    it('should match composite components', () => {
      class Foo extends React.Component {
        render() { return <div /> }
      }
      const wrapper = shallow(
        <div>
          <Foo />
        </div>
      );
      const b = <Foo />;
      expect(wrapper.contains(b)).to.be.true;
    });

  });

  describe('find', () => {

    it('should find an element based on a class name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
        </div>
      );
      expect(wrapper.find(".foo").type).to.equal("input");
    });

    it('should find an element based on a tag name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
        </div>
      );
      expect(wrapper.find("input")._store.props.className).to.equal("foo");
    });

    it('should find a component based on a constructor', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow(
        <div>
          <Foo className="foo" />
        </div>
      );
      expect(wrapper.find(Foo).type).to.equal(Foo);
    });

  });

  describe('findAll', () => {

    it('should find elements based on a class name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <button className="foo" />
        </div>
      );
      expect(wrapper.findAll(".foo").length).to.equal(2);
    });

    it('should find elements based on a tag name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      );
      expect(wrapper.findAll('input').length).to.equal(2);
      expect(wrapper.findAll('button').length).to.equal(1);
    });

    it('should find elements based on a constructor', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      );
      expect(wrapper.findAll('input').length).to.equal(2);
      expect(wrapper.findAll('button').length).to.equal(1);
    });

  });

  describe('findWhere', () => {

    it('should return all elements for a truthy test', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
        </div>
      );
      expect(wrapper.findWhere(x=>true).length).to.equal(3);
    });

    it('should return no elements for a falsy test', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
        </div>
      );
      expect(wrapper.findWhere(x=>false).length).to.equal(0);
    });

  });

});