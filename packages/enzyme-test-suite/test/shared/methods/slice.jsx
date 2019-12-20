import React from 'react';
import { expect } from 'chai';

export default function describeSlice({
  Wrap,
}) {
  describe('.slice([begin[, end]])', () => {
    it('returns an identical wrapper if no params are set', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const slice = wrapper.find('.foo').slice();
      expect(slice).to.have.lengthOf(3);
      expect(slice.at(0).hasClass('bax')).to.equal(true);
      expect(slice.at(1).hasClass('bar')).to.equal(true);
      expect(slice.at(2).hasClass('baz')).to.equal(true);
    });

    it('returns a new wrapper if begin is set', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const slice = wrapper.find('.foo').slice(1);
      expect(slice).to.have.lengthOf(2);
      expect(slice.at(0).hasClass('bar')).to.equal(true);
      expect(slice.at(1).hasClass('baz')).to.equal(true);
    });

    it('returns a new wrapper if begin and end are set', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const slice = wrapper.find('.foo').slice(1, 2);
      expect(slice).to.have.lengthOf(1);
      expect(slice.at(0).hasClass('bar')).to.equal(true);
    });

    it('returns a new wrapper if begin and end are set (negative)', () => {
      const wrapper = Wrap((
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      ));
      const slice = wrapper.find('.foo').slice(-2, -1);
      expect(slice).to.have.lengthOf(1);
      expect(slice.at(0).hasClass('bar')).to.equal(true);
    });
  });
}
