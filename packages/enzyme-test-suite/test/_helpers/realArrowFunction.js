try {
  // eslint-disable-next-line global-require
  module.exports = require('./untranspiledArrowFunction');
} catch (e) {
  module.exports = x => () => x;
}
