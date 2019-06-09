import { is } from './version';

export default function describeHooks({
  Wrap,
  Wrapper,
}, ...hooks) {
  const WrapperName = Wrapper.name;
  const isShallow = WrapperName === 'ShallowWrapper';
  const isMount = WrapperName === 'ReactWrapper';
  const hasDOM = isMount;
  const makeDOMElement = () => (hasDOM ? global.document.createElement('div') : { nodeType: 1 });

  hooks.forEach((hook) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`../shared/hooks/${hook}`).default({
      hasHooks: is('>= 16.8'),
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
