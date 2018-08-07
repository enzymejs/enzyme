import ReactWrapper from './ReactWrapper';
import { trackWrapper } from './wrapperSandbox';

/**
 * Mounts and renders a react component into the document and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ReactWrapper}
 */
export default function mount(node, options) {
  const wrapper = new ReactWrapper(node, null, options);
  trackWrapper(wrapper);
  return wrapper;
}
