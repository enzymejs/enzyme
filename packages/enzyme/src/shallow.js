import ShallowWrapper from './ShallowWrapper';
import { trackMountedWrapper } from './mountTracking';

/**
 * Shallow renders a react component and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ShallowWrapper}
 */
export default function shallow(node, options) {
  const wrapper = new ShallowWrapper(node, null, options);
  trackMountedWrapper(wrapper);
  return wrapper;
}
