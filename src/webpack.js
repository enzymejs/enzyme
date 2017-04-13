import { IgnorePlugin } from 'webpack';

import { REACT013, REACT155 } from './version';

export function getPluginsForInstalledReact() {
  var plugins = [];

  /*
  this list of conditional IgnorePlugins mirrors the conditional
  requires in src/react-compat.js and exists to avoid error
  output from the webpack compilation
  */

  if (!REACT013) {
    plugins.push(new IgnorePlugin(/react\/lib\/ExecutionEnvironment/));
    plugins.push(new IgnorePlugin(/react\/lib\/ReactContext/));
    plugins.push(new IgnorePlugin(/react\/addons/));
  }
  if (REACT013) {
    plugins.push(new IgnorePlugin(/react-dom/));
  }
  if (REACT013 || REACT155) {
    plugins.push(new IgnorePlugin(/react-addons-test-utils/));
  }
  if (!REACT155) {
    plugins.push(new IgnorePlugin(/react-test-renderer/));
    plugins.push(new IgnorePlugin(/react-dom\/test-utils/));
    plugins.push(new IgnorePlugin(/create-react-class/));
  }

  return plugins;
}
