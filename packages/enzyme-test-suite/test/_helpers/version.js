import React from 'react';
import semver from 'semver';

export const VERSION = React.version;

const [major, minor] = VERSION.split('.');

export const REACT013 = VERSION.slice(0, 4) === '0.13';
export const REACT014 = VERSION.slice(0, 4) === '0.14';
export const REACT15 = major === '15';
export const REACT150 = REACT15 && minor === '0';
export const REACT151 = REACT15 && minor === '1';
export const REACT152 = REACT15 && minor === '2';
export const REACT153 = REACT15 && minor === '3';
export const REACT16 = major === '16';

export function gt(v) { return semver.gt(VERSION, v); }
export function lt(v) { return semver.lt(VERSION, v); }
export function is(range) { return semver.satisfies(VERSION, range); }
