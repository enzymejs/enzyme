export default function describeLifecycles({
  Wrap,
  Wrapper,
}, ...lifecycles) {
  const WrapperName = Wrapper.name;
  const isShallow = WrapperName === 'ShallowWrapper';
  const isMount = WrapperName === 'ReactWrapper';
  const hasDOM = isMount;
  const makeDOMElement = () => (hasDOM ? global.document.createElement('div') : { nodeType: 1 });

  lifecycles.forEach((lifecycle) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`../shared/lifecycles/${lifecycle}`).default({
      Wrap,
      WrapRendered: isShallow ? Wrap : (...args) => Wrap(...args).children(),
      Wrapper,
      WrapperName,
      isShallow,
      isMount,
      hasDOM,
      makeDOMElement,
    });
  });
}
