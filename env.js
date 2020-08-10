'use strict';

const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const rimraf = require('rimraf');
const semver = require('semver');

const promisify = (fn) => new Promise((res, rej) => {
  const done = (err, val) => (err ? rej(err) : res(val));
  fn(done);
});
const getFile = (fpath) => promisify((cb) => fs.readFile(fpath, 'utf8', cb));
// const getFiles = fpath => promisify(cb => fs.readdir(fpath, cb));
const getJSON = (fpath) => getFile(fpath).then((json) => JSON.parse(json));
const writeFile = (fpath, src) => promisify((cb) => {
  console.log('writeFile', fpath, src);
  if (process.env.DEBUG) {
    cb();
  } else {
    fs.writeFile(fpath, src, cb);
  }
});
const writeJSON = (fpath, json, pretty = false) => writeFile(
  fpath,
  (pretty ? JSON.stringify(json, null, 2) : JSON.stringify(json)) + '\n'
);
const primraf = (fpath) => promisify((cb) => {
  console.log('rimraf', fpath);
  if (process.env.DEBUG) {
    cb();
  } else {
    rimraf(fpath, cb);
  }
});
const run = (cmd, ...args) => promisify((cb) => {
  console.log(cmd + ' ' + args.join(' '));
  const child = spawn(
    process.env.DEBUG ? 'echo' : cmd,
    process.env.DEBUG ? [cmd].concat(args) : args,
    { stdio: 'inherit' }
  );
  child.on('exit', cb);
});

// This script is executed with a single argument, indicating the version of
// react and adapters etc. that we want to set ourselves up for testing.
// should be "14" for "enzyme-adapter-react-14", "15.4" for "enzyme-adapter-react-15.4", etc.
const version = process.argv[2];

// This script will do the following:
//
// 1. remove / uninstall all relevant modules
// 2. find the adapter for the passed in version
// 3. get the package.json for the adapter
// 4. add the adapter to the dev-deps for enzyme-test-suite package
// 5. call lerna bootstrap to link all the packages
// 6. install all of the package's peer deps at the top level

const root = process.cwd();

function getAdapter(reactVersion) {
  if (semver.intersects(reactVersion, '0.13.x')) {
    return '13';
  }
  if (semver.intersects(reactVersion, '0.14.x')) {
    return '14';
  }
  if (semver.intersects(reactVersion, '^15.0.0-0')) {
    if (semver.intersects(reactVersion, '>= 15.5')) {
      return '15';
    }
    return '15.4';
  }
  if (semver.intersects(reactVersion, '^16.0.0-0')) {
    if (semver.intersects(reactVersion, '>= 16.4')) {
      return '16';
    }
    if (semver.intersects(reactVersion, '~16.3')) {
      return '16.3';
    }
    if (semver.intersects(reactVersion, '~16.2')) {
      return '16.2';
    }
    if (semver.intersects(reactVersion, '~16.0 || ~16.1')) {
      return '16.1';
    }
  }
  if (semver.intersects(reactVersion, '^17.0.0')) {
    return '17';
  }
  return null;
}
const reactVersion = version < 15 ? '0.' + version : version;
const adapterVersion = process.env.ADAPTER || getAdapter(reactVersion) || version;
const adapterName = `enzyme-adapter-react-${adapterVersion}`;
const adapterPackageJsonPath = path.join(root, 'packages', adapterName, 'package.json');
const testPackageJsonPath = path.join(root, 'packages', 'enzyme-test-suite', 'package.json');

if (!fs.statSync(adapterPackageJsonPath)) {
  throw new Error('Adapter not found: "' + adapterName + '"');
}

const packagesToRemove = [
  'react',
  'react-dom',
  'react-addons-test-utils',
  'react-test-renderer',
  'create-react-class',
].map((s) => `./node_modules/${s}`);

const additionalDirsToRemove = [
  'node_modules/.bin/npm',
  'node_modules/.bin/npm.cmd',
];

const rmrfs = []
  .concat(packagesToRemove)
  .concat(additionalDirsToRemove);

Promise.resolve()
  .then(() => Promise.all(rmrfs.map((s) => primraf(s))))
  .then(() => run('npm', 'i'))
  .then(() => Promise.all([
    getJSON(adapterPackageJsonPath),
    getJSON(testPackageJsonPath),
  ]))
  .then(([adapterJson, testJson]) => {
    const peerDeps = adapterJson.peerDependencies;
    const installs = Object.keys(peerDeps)
      .filter((key) => !key.startsWith('enzyme'))
      .map((key) => `${key}@${key.startsWith('react') ? reactVersion : peerDeps[key]}`);

    if (process.env.RENDERER) {
      // eslint-disable-next-line no-param-reassign
      adapterJson.dependencies['react-test-renderer'] = process.env.RENDERER;
    }

    // eslint-disable-next-line no-param-reassign
    testJson.dependencies[adapterName] = adapterJson.version;

    return writeJSON(adapterPackageJsonPath, adapterJson, true).then(() => Promise.all([
      // npm install the peer deps at the root
      run('npm', 'i', '--no-save', ...installs),

      // add the adapter to the dependencies of the test suite
      writeJSON(testPackageJsonPath, testJson, true),
    ]));
  })
  .then(() => run('lerna', 'bootstrap', '--hoist=\'react*\''))
  .then(() => getJSON(testPackageJsonPath))
  .then((testJson) => {
    // now that we've lerna bootstrapped, we can remove the adapter from the
    // package.json so there is no diff
    // eslint-disable-next-line no-param-reassign
    delete testJson.dependencies[adapterName];
    return writeJSON(testPackageJsonPath, testJson, true);
  })
  .catch((err) => console.error(err));
