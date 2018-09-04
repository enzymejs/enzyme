/* eslint no-undef: 0, global-require: 0 */
/**
 * This file is needed only when karma runs the test suite. We can't guarantee
 * what browser travis will actually run karma with, so we need to load in
 * browser shims to make sure everything works that we expect. I'd love to
 * put this somewhere else (ie, karma.conf.js), but I can't figure out how
 * to tell karma to run a file before everything else. This is the next best
 * thing I guess...
 */
const isBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) === '[object Window]';

if (isBrowser) {
  require('airbnb-browser-shims');
}
