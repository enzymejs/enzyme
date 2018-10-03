'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const glob = require('glob-gitignore');

const packagesDir = path.join(__dirname, 'packages');

const packages = (process.argv.length > 2 ? [process.argv[2]] : glob.sync('*', { cwd: packagesDir }))
  .map(name => JSON.parse(fs.readFileSync(path.join(packagesDir, name, 'package.json'))))
  .filter(x => !x.private && x.name !== 'enzyme-example-mocha');

packages.forEach((pkg) => {
  const tag = `${pkg.name}@${pkg.version}`;
  const log = spawnSync('git', ['log', '--oneline', `${tag}..HEAD`, path.join(packagesDir, pkg.name)], { stdio: 'pipe' });
  if (log.stdout.length > 0 || log.stderr.length > 0) {
    console.log(tag);
    spawnSync('git', ['log', '--oneline', `${tag}..HEAD`, path.join(packagesDir, pkg.name)], { stdio: 'inherit' });
    console.log('\n');
  }
});
