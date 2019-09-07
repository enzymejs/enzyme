'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const glob = require('glob-gitignore');

const packagesDir = path.join(__dirname, 'packages');
const docsDir = path.join(__dirname, 'docs');

const packages = (process.argv.length > 2 ? [process.argv[2]] : glob.sync('*', { cwd: packagesDir }))
  .map((name) => JSON.parse(fs.readFileSync(path.join(packagesDir, name, 'package.json'))))
  .filter((x) => !x.private && x.name !== 'enzyme-example-mocha');

packages.forEach((pkg) => {
  const tag = `${pkg.name === 'docs' ? 'enzyme' : pkg.name}@${pkg.version}`;
  const dir = path.join(packagesDir, pkg.name);
  const logArgs = ['--no-pager', 'log', '--oneline', `${tag}..HEAD`, dir, ':!**/.eslintrc'].concat(pkg.name === 'enzyme' ? docsDir : []);
  const log = spawnSync('git', logArgs, { stdio: 'pipe' });
  if (log.stdout.length > 0 || log.stderr.length > 0) {
    console.log(tag);
    spawnSync('git', logArgs, { stdio: 'inherit' });
    console.log('\n');
  }
});
