/* globals jsdom */

import React from 'react';

/**
 * Simple wrapper around mocha describe which allows a boolean to be passed in first which
 * determines whether or not the test will be run
 */
export function describeIf(test, a, b) {
  if (test) {
    describe(a, b);
  } else {
    describe.skip(a, b);
  }
}

/**
 * Simple wrapper around mocha it which allows a boolean to be passed in first which
 * determines whether or not the test will be run
 */
export function itIf(test, a, b) {
  if (test) {
    it(a, b);
  } else {
    it.skip(a, b);
  }
}

/**
 * Simple wrapper around mocha it which allows an array of possible values to test against.
 * Each test will be wrapped in a try/catch block to handle any errors.
 *
 * @param {Object[]} data
 * @param {String} message
 * @param {Function} factory
 */
export function itWithData(data, message, factory) {
  data.forEach((testCase) => {
    it(`${message} ${testCase.message}`, () => factory(testCase));
  });
}

function only(a, b) {
  describe('(uses jsdom)', () => {
    if (typeof jsdom === 'function') {
      jsdom();
      describe.only(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}

function skip(a, b) {
  describe('(uses jsdom)', () => {
    if (typeof jsdom === 'function') {
      jsdom();
      describe.skip(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}

export function describeWithDOM(a, b) {
  describe('(uses jsdom)', () => {
    if (global.document) {
      describe(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}

describeWithDOM.only = only;
describeWithDOM.skip = skip;

/**
 * React component used for testing.
 */
class TestHelper extends React.Component {
  render() {
    return <div />;
  }
}

/**
 * Possible values for React render() checks.
 */
export function generateEmptyRenderData() {
  return [
    // Returns true for empty
    { message: 'false', value: false, expectResponse: true },
    { message: 'null', value: null, expectResponse: true },

    // Returns false for empty, valid returns
    { message: 'React component', value: <TestHelper />, expectResponse: false },
    { message: 'React element', value: <span />, expectResponse: false },
    { message: 'React element', value: <noscript />, expectResponse: false },
  ];
}
