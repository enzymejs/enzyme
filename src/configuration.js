const configuration = {};

module.exports = {
  get() { return { ...configuration }; },
  merge(extra) { Object.assign(configuration, extra); },
};
