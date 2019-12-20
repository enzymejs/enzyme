import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

import {
  describeIf,
} from '../../_helpers';

import {
  useImperativeHandle,
  useRef,
  forwardRef,
} from '../../_helpers/react-compat';

export default function describeUseImperativeHandle({
  hasHooks,
  Wrap,
  isShallow,
}) {
  describeIf(hasHooks, 'hooks: useImperativeHandle', () => {
    function Computer({ compute }, ref) {
      const computerRef = useRef({ compute });
      useImperativeHandle(ref, () => ({
        compute: () => {
          computerRef.current.compute();
        },
      }));
      return <div />;
    }

    const FancyComputer = forwardRef && forwardRef(Computer);

    class ParentComputer extends React.Component {
      componentDidMount() {
        if (this.ref) {
          this.ref.compute();
        }
      }

      render() {
        return <FancyComputer ref={(ref) => { this.ref = ref; }} {...this.props} />;
      }
    }

    it('able to call method with imperative handle', () => {
      const compute = sinon.spy();
      Wrap(<ParentComputer compute={compute} />);

      expect(compute).to.have.property('callCount', isShallow ? 0 : 1);
    });
  });
}
