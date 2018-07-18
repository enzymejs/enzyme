import ReactWrapper from './ReactWrapper';
import configuration from './configuration';

/**
 * Mounts and renders a react component into the document and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ReactWrapper}
 */
export default function mount(node, options) {
  const { wrapper } = configuration.get();
  // the API for creating built-in wrapper vs a custom wrapper
  // should be standardised
  return wrapper ? wrapper(node, options) : new ReactWrapper(node, null, options);
}
