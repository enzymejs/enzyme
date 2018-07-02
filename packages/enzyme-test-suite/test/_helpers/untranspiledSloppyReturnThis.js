/* eslint
  prefer-spread: 0,
  func-names: 0,
  prefer-rest-params: 0,
*/
module.exports = function (fn) {
  return function () {
    return fn.apply(null, [this].concat(Array.prototype.slice.call(arguments)));
  };
};
