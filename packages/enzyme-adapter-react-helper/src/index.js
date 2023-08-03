import { configure } from 'enzyme';

const adapterNames = [
  'enzyme-adapter-react-16',
  'enzyme-adapter-react-16.3',
  'enzyme-adapter-react-16.2',
  'enzyme-adapter-react-16.1',
  'enzyme-adapter-react-15',
  'enzyme-adapter-react-15.4',
  'enzyme-adapter-react-14',
  'enzyme-adapter-react-13',
];
export default function setupEnzymeAdapter(enzymeOptions = {}, adapterOptions = {}) {
  for (let i = 0; i < adapterNames.length; i += 1) {
    try {
      const adapterName = adapterNames[i];
      // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved, import/no-dynamic-require
      const Adapter = require(adapterName);
      configure({
        adapter: new Adapter(adapterOptions),
        ...enzymeOptions,
      });
      return;
    } catch (_ignoreError) {
      // continue regardless of error
    }
  }
  throw new Error(
    'It seems as though you don’t have any `enzyme-adapter-react-*` installed. Please install the relevant version and try again.',
  );
}
