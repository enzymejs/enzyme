import React from 'react';
import { expect } from 'chai';

export default function describeGetNodes({
  Wrap,
  WrapperName,
}) {
  describe('.getNodes()', () => {
    it('throws', () => {
      const wrapper = Wrap(<div />);
      expect(() => wrapper.getNodes()).to.throw(
        `${WrapperName}::getNodes() is no longer supported.`,
      );
    });
  });
}
