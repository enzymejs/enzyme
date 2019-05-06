import semver from 'semver';

export default function getAdapterForReactVersion(reactVersion) {
  const normalizedVersion = semver.coerce(reactVersion);

  if (semver.satisfies(normalizedVersion, '^16.4.0-0')) {
    return 'enzyme-adapter-react-16';
  }
  if (semver.satisfies(normalizedVersion, '~16.3.0-0')) {
    return 'enzyme-adapter-react-16.3';
  }
  if (semver.satisfies(normalizedVersion, '~16.2')) {
    return 'enzyme-adapter-react-16.2';
  }
  if (semver.satisfies(normalizedVersion, '~16.0.0-0 || ~16.1')) {
    return 'enzyme-adapter-react-16.1';
  }
  if (semver.satisfies(normalizedVersion, '^15.5.0')) {
    return 'enzyme-adapter-react-15';
  }
  if (semver.satisfies(normalizedVersion, '15.0.0 - 15.4.x')) {
    return 'enzyme-adapter-react-15.4';
  }
  if (semver.satisfies(normalizedVersion, '^0.14.0')) {
    return 'enzyme-adapter-react-14';
  }
  if (semver.satisfies(normalizedVersion, '^0.13.0')) {
    return 'enzyme-adapter-react-13';
  }

  throw new RangeError(`No Enzyme adapter could be found for React version “${reactVersion}”`);
}
