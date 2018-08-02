import { get } from "./configuration";

const mountedWrappers = [];

/**
 * Stores a reference to a testing wrapper for later unmounting
 * via unmountAllWrappers()
 * 
 * @param {ReactWrapper|ShallowWrapper} wrapper 
 */
export function trackMountedWrapper(wrapper) {
  const {enableMountTracking} = get();
  if (enableMountTracking) {
    mountedWrappers.push(wrapper);
  }
}

/**
 * Unmounts all actively mounted Enzyme wrappers.
 * 
 * Usually, this can be run once for an entire test suite after all each test
 * (and its nested hooks)have been run. However, in some cases this may need
 * to be run this manually.This is most commonly needed when a component uses
 * timeouts/ animation frames that are mocked for tests; in that case, waiting
 * until after you have restored those globals will lead to their stored
 * identifiers being invalid.
 */
export function unmountAllWrappers() {
  mountedWrappers.forEach(wrapper => wrapper.unmount());
  mountedWrappers = [];
}
