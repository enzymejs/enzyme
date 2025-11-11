import { configure } from 'enzyme';

export default function setupEnzymeAdapter(enzymeOptions = {}, adapterOptions = {}) {
  let Adapter;

  try {
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved
    Adapter = require('enzyme-adapter-react-17');
  } catch (R) {
    try {
      // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved
      Adapter = require('enzyme-adapter-react-16');
    } catch (E) {
      try {
        // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved
        Adapter = require('enzyme-adapter-react-16.3');
      } catch (A) {
        try {
          // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved
          Adapter = require('enzyme-adapter-react-16.2');
        } catch (C) {
          try {
            // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved
            Adapter = require('enzyme-adapter-react-16.1');
          } catch (r) {
            try {
              // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved
              Adapter = require('enzyme-adapter-react-15');
            } catch (e) {
              try {
                // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved
                Adapter = require('enzyme-adapter-react-15.4');
              } catch (a) {
                try {
                  // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved
                  Adapter = require('enzyme-adapter-react-14');
                } catch (c) {
                  try {
                    // eslint-disable-next-line import/no-extraneous-dependencies, global-require, import/no-unresolved
                    Adapter = require('enzyme-adapter-react-13');
                  } catch (t) {
                    throw new Error('It seems as though you don’t have any `enzyme-adapter-react-*` installed. Please install the relevant version and try again.');
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  configure({
    adapter: new Adapter(adapterOptions),
    ...enzymeOptions,
  });
}
