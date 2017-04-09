import React from 'react';
import adapter from '../../src/react15Adapter';

describe.only('react 15 adapter', () => {
  it('should do something', () => {
    const renderer = adapter.createRenderer();
    const renderResult = renderer.render(<div>a</div>);
    console.log(renderResult);
  });
});
