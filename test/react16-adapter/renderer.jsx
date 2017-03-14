import { expect } from 'chai';
import React from 'react';

import Renderer from '../../src/react-16-adapter/renderer';

describe.only('react 16 renderer', () => {
  describe('get RST node', () => {
    it('tests toTree', () => {
      const randomElement =
        <div>
          Child
          <div>
            Div2
          </div>
          <span>
            Span 3
          </span>
        </div>;
      const renderer = new Renderer();
      renderer.render(randomElement);
      const tree = renderer.getNode();
      console.log(JSON.stringify(tree, 0, 2));
    });
  });
});
