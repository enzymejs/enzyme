import React from 'react';
import semver from 'semver';

export const VERSION = React.version;

const [major, minor] = VERSION.split('.');

export const REACT013 = VERSION.slice(0, 4) === '0.13';
export const REACT014 = VERSION.slice(0, 4) === '0.14';
export const REACT15 = major === '15';
export const REACT155 = REACT15 && minor >= 5;
export const REACT16 = major === '16';

export function gt(v) { return semver.gt(VERSION, v); }
export function lt(v) { return semver.lt(VERSION, v); }
export function is(range) { return semver.satisfies(VERSION, range); }
