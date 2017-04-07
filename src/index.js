import ReactWrapper from './ReactWrapper';
import ShallowWrapper from './ShallowWrapper';

import mount from './mount';
import shallow from './shallow';
import render from './render';

import { configureAdapter as configure } from './adapter';
import react15Adapter from './react15Adapter';

// Keep this in for now for dev easyness
configure(react15Adapter);

export {
  render,
  shallow,
  mount,
  ShallowWrapper,
  ReactWrapper,
  configure,
};
