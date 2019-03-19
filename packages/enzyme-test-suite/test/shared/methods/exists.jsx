import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

export default function describeExists({
  Wrap,
  Wrapper,
}) {
  describe('.exists()', () => {
    it('has no required arguments', () => {
      expect(Wrapper.prototype.exists).to.have.lengthOf(0);
    });

    describe('without argument', () => {
      it('returns true if node exists in wrapper', () => {
        const wrapper = Wrap(<div className="foo" />);
        expect(wrapper.find('.bar').exists()).to.equal(false);
        expect(wrapper.find('.foo').exists()).to.equal(true);
      });
    });
    describe('with argument', () => {
      it('throws on invalid EnzymeSelector', () => {
        const wrapper = Wrap(<div />);

        expect(() => wrapper.exists(null)).to.throw(TypeError);
        expect(() => wrapper.exists(undefined)).to.throw(TypeError);
        expect(() => wrapper.exists(45)).to.throw(TypeError);
        expect(() => wrapper.exists({})).to.throw(TypeError);
      });

      it('returns .find(arg).exists() instead', () => {
        const wrapper = Wrap(<div />);
        const fakeFindExistsReturnVal = { toString() { return 'fake .find(arg).exists() return value'; } };
        const fakeSelector = '.someClass';
        wrapper.find = sinon.stub().returns({ exists() { return fakeFindExistsReturnVal; } });
        const existsResult = wrapper.exists(fakeSelector);
        expect(wrapper.find).to.have.property('callCount', 1);
        expect(wrapper.find.firstCall.args[0]).to.equal(fakeSelector);
        expect(existsResult).to.equal(fakeFindExistsReturnVal);
      });
    });
  });
}
