import React from 'react';
import { expect } from 'chai';

export default function describeGetNode({
  Wrap,
  WrapperName,
  isShallow,
}) {
  describe('.getNode()', () => {
    it('throws', () => {
      const wrapper = Wrap(<div />);
      expect(() => wrapper.getNode()).to.throw(
        `${WrapperName}::getNode() is no longer supported. Use ${WrapperName}::${isShallow ? 'getElement' : 'instance'}() instead`,
      );
    });
  });
}
