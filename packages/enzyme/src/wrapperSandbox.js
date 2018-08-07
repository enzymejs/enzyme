import { get } from './configuration';

const wrappers = new Set();

/**
 * Stores a reference to a testing wrapper for later unmounting
 * via unmountAllWrappers()
 *
 * @param {ReactWrapper|ShallowWrapper} wrapper
 */
export function trackWrapper(wrapper) {
  const { enableSandbox } = get();
  if (enableSandbox) {
    wrappers.add(wrapper);
  }
}

/**
 * Unmounts all sandboxed Enzyme wrappers.
 *
 * Usually, this can be run once for an entire test suite after all each test
 * (and its nested hooks)have been run. However, in some cases this may need
 * to be run this manually.This is most commonly needed when a component uses
 * timeouts/ animation frames that are mocked for tests; in that case, waiting
 * until after you have restored those globals will lead to their stored
 * identifiers being invalid.
 */
export function unmountAllWrappers() {
  wrappers.forEach(wrapper => wrapper.unmount());
  wrappers.clear();
}
