#! /usr/bin/env node
/* eslint no-console: 0 */

import 'airbnb-js-shims';

import semver from 'semver';
import npmRun from 'npm-run';
import getAdapterForReactVersion from './getAdapterForReactVersion';

const reactEnv = process.env.REACT;
const reactArg = process.argv[2];

if (reactEnv && !semver.validRange(reactEnv)) {
  throw new Error('REACT environment variable is not a valid semver range');
}

if (reactArg && !semver.validRange(reactArg)) {
  throw new Error('Argument supplied to enzyme-adapter-react-install is not a valid semver range');
}

const reactVersion = reactEnv || reactArg;

if (!semver.intersects(reactVersion, '>=0.13')) {
  throw new Error('semver range is not valid. Please provide a valid semver range as an argument or environment variable.');
}

console.log('Cleaning up React and related packages...');
const commands = [
  'npm uninstall --no-save react-dom react-test-renderer react-addons-test-utils enzyme-adapter-react-14 enzyme-adapter-react-15.4 enzyme-adapter-react-15 enzyme-adapter-react-16',
  'rimraf node_modules/react-test-renderer node_modules/react',
  'npm prune',
];

try {
  commands.forEach((cmd) => {
    npmRun.execSync(cmd, { stdio: 'inherit' });
  });
} catch (e) {
  console.error('An uninstallation failed');
  console.log(e);
  process.exit(1);
}

console.log(`Installing React@${reactVersion} and related packages...`);
const adapterName = getAdapterForReactVersion(reactVersion);

try {
  npmRun.execSync(`install-peerdeps -S ${adapterName}`, { stdio: 'inherit' });
} catch (e) {
  console.error('An installation failed');
  console.log(e);
  process.exit(666);
}
