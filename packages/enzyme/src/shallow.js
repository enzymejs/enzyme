import ShallowWrapper from './ShallowWrapper';
import { trackWrapper } from './wrapperSandbox';

/**
 * Shallow renders a react component and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ShallowWrapper}
 */
export default function shallow(node, options) {
  const wrapper = new ShallowWrapper(node, null, options);
  trackWrapper(wrapper);
  return wrapper;
}
