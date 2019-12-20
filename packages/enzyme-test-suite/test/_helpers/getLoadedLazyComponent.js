import { fakeDynamicImport } from 'enzyme-adapter-utils';
import { lazy } from './react-compat';
import { is, VERSION } from './version';

function fakeSyncThenable(result) {
  return {
    then(resolve) {
      return resolve({ default: result });
    },
  };
}

export default function getLoadedLazyComponent(wrappedComponent) {
  if (is('>= 16.8')) {
    return lazy(() => fakeSyncThenable(wrappedComponent));
  }
  if (is('>= 16.6')) {
    const LazyComponent = lazy(() => fakeDynamicImport(wrappedComponent));
    /**
     * Before React v16.8 there's no public api to synchronously / await
     * loaded lazy component.
     * So we have to hack this by setting `_result` and `_status` implementation.
     */
    /* eslint-disable no-underscore-dangle */
    LazyComponent._result = wrappedComponent;
    /* eslint-disable no-underscore-dangle */
    LazyComponent._status = 1;
    return LazyComponent;
  }
  throw Error(`Current React version ${VERSION} doesn't support \`lazy()\` api.`);
}
