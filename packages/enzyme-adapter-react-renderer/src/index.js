/* eslint global-require: 0 */
const Adapter = require('./ReactTestRendererAdapter');
const MountWrapper = require('./ReactMountWrapper');

module.exports = Adapter;
module.exports.wrapper = MountWrapper;
