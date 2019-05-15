import semver from 'semver';

function removePreRelease(version) {
  return semver.inc(version, 'patch');
}

export default function getAdapterForReactVersion(reactVersion) {
  const versionRange = semver.prerelease(reactVersion)
    ? removePreRelease(reactVersion)
    : semver.validRange(reactVersion);

  if (semver.intersects(versionRange, '^16.4.0')) {
    return 'enzyme-adapter-react-16';
  }
  if (semver.intersects(versionRange, '~16.3.0')) {
    return 'enzyme-adapter-react-16.3';
  }
  if (semver.intersects(versionRange, '~16.2')) {
    return 'enzyme-adapter-react-16.2';
  }
  if (semver.intersects(versionRange, '~16.0.0 || ~16.1')) {
    return 'enzyme-adapter-react-16.1';
  }
  if (semver.intersects(versionRange, '^15.5.0')) {
    return 'enzyme-adapter-react-15';
  }
  if (semver.intersects(versionRange, '15.0.0 - 15.4.x')) {
    return 'enzyme-adapter-react-15.4';
  }
  if (semver.intersects(versionRange, '^0.14.0')) {
    return 'enzyme-adapter-react-14';
  }
  if (semver.intersects(versionRange, '^0.13.0')) {
    return 'enzyme-adapter-react-13';
  }

  throw new RangeError(`No Enzyme adapter could be found for React version “${reactVersion}”`);
}
