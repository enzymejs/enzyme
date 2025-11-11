import semver from 'semver';

function getValidRange(version) {
  return semver.prerelease(version)
    // Remove pre-release versions by incrementing them. This works because a pre-release is less
    // than the corresponding non-pre-prelease version.
    ? semver.inc(version, 'patch')
    // Convert partial versions, such as 16 or 16.8, to their corresponding range notation, so that
    // they work with the rest of the semver functions.
    : semver.validRange(version);
}

export default function getAdapterForReactVersion(reactVersion) {
  const versionRange = getValidRange(reactVersion);

  if (semver.intersects(versionRange, '^17.0.0')) {
    return 'enzyme-adapter-react-17';
  }
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
