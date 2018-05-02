import { EnzymeAdapter } from 'enzyme';
import ReactTestRenderer from 'react-test-renderer';

class ReactTestRendererAdapter extends EnzymeAdapter {
  constructor() {
    super();
  }
  createMountRenderer(options) {
    let instance = null;
    return {
      render(element) {
        instance = ReactTestRenderer.create(element);
      },
      getNode() {
        return instance.toTree();
      },
      unmount() {
        instance.unmount();
      }
    };
  }
  createRenderer(options) {
    switch (options.mode) {
      case EnzymeAdapter.MODES.MOUNT: return this.createMountRenderer(options);
      default:
        throw new Error(`Enzyme Internal Error: Unrecognized mode: ${options.mode}`);
    }
  }
}

module.exports = ReactTestRendererAdapter;
