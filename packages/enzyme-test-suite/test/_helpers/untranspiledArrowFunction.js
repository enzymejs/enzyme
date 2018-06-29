// this file is ignored in babelrc, specifically so that tests will be able to run
// on a real arrow function that lacks a .prototype
module.exports = x => () => x;
