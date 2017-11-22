import React from 'react';
import { intersects } from 'semver';

export default function ifReact(range, yes, no) {
  if (typeof yes !== 'function') { throw new TypeError('"yes" must be a function'); }
  if (typeof no !== 'function') { throw new TypeError('"no" must be a function'); }
  return intersects(range, React.version) ? yes : no;
}
