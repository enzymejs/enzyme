'use strict';

const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const rimraf = require('rimraf');

const promisify = fn => new Promise((res, rej) => {
  const done = (err, val) => (err ? rej(err) : res(val));
  fn(done);
});
const getFile = fpath => promisify(cb => fs.readFile(fpath, 'utf8', cb));
// const getFiles = fpath => promisify(cb => fs.readdir(fpath, cb));
const getJSON = fpath => getFile(fpath).then(json => JSON.parse(json));
const writeFile = (fpath, src) => promisify(cb => fs.writeFile(fpath, src, cb));
const writeJSON = (fpath, json, pretty = false) => writeFile(
  fpath,
  pretty
    ? JSON.stringify(json, null, 2)
    : JSON.stringify(json)
);
const primraf = fpath => promisify(cb => rimraf(fpath, cb));
const run = (cmd, ...args) => promisify((cb) => {
  const child = spawn(cmd, args, { stdio: 'inherit' });
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

const adapterVersions = {
  '15.0': 15.4,
  15.1: 15.4,
  15.2: 15.4,
  15.3: 15.4,
  15.5: 15,
  '16.0': 16.1,
  16.4: 16,
  16.5: 16,
  16.6: 16,
  16.7: 16,
  16.8: 16,
};
const reactVersion = version < 15 ? '0.' + version : version;
const adapterVersion = process.env.ADAPTER || adapterVersions[version] || version;
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
].map(s => `./node_modules/${s}`);

const additionalDirsToRemove = [
  'node_modules/.bin/npm',
  'node_modules/.bin/npm.cmd',
];

const rmrfs = []
  .concat(packagesToRemove)
  .concat(additionalDirsToRemove);

Promise.resolve()
  .then(() => Promise.all(rmrfs.map(s => primraf(s))))
  .then(() => run('npm', 'i'))
  .then(() => Promise.all([
    getJSON(adapterPackageJsonPath),
    getJSON(testPackageJsonPath),
  ]))
  .then(([adapterJson, testJson]) => {
    const peerDeps = adapterJson.peerDependencies;
    const installs = Object.keys(peerDeps)
      .filter(key => !key.startsWith('enzyme'))
      .map(key => `${key}@${key.startsWith('react') ? reactVersion : peerDeps[key]}`);

    // eslint-disable-next-line no-param-reassign
    testJson.dependencies[adapterName] = adapterJson.version;

    return Promise.all([
      // npm install the peer deps at the root
      run('npm', 'i', '--no-save', ...installs),

      // add the adapter to the dependencies of the test suite
      writeJSON(testPackageJsonPath, testJson, true),
    ]);
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
  .catch(err => console.error(err));
