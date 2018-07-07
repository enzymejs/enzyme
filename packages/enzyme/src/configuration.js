import validateAdapter from './validateAdapter';

const configuration = {};

export function get() {
  return { ...configuration };
}

export function merge(extra) {
  if (extra.adapter) {
    validateAdapter(extra.adapter);
  }
  Object.assign(configuration, extra);
}
