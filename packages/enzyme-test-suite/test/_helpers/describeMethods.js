export default function describeMethods({
  Wrap,
  Wrapper,
}, ...methods) {
  const WrapperName = Wrapper.name;
  const isShallow = WrapperName === 'ShallowWrapper';
  const isMount = WrapperName === 'ReactWrapper';
  const hasDOM = isMount;
  const makeDOMElement = () => (hasDOM ? global.document.createElement('div') : { nodeType: 1 });

  methods.forEach((method) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`../shared/methods/${method}`).default({
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
