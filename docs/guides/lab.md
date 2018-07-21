# Using enzyme with Lab and Code

[Lab](https://github.com/hapijs/lab) is a simple test utility for node & part of the [Hapi.js](https://github.com/hapijs/hapi) framework universe. Lab's initial code borrowed heavily from [Mocha](https://github.com/mochajs/mocha). [Code](https://github.com/hapijs/code) is Lab's standard assertion library and was created as a direct rewrite of [Chai](https://github.com/chaijs).


# Example Test: enzyme + Lab + Code

```jsx
import { shallow, mount, render } from 'enzyme';
import React from 'react';

const Code = require('code');
const Lab = require('lab');

const lab = Lab.script();
exports.lab = lab;

lab.suite('A suite', () => {
  lab.test('calls componentDidMount', (done) => {
    const wrapper = mount(<Foo />);
    Code.expect(Foo.prototype.componentDidMount.callCount).to.equal(1);
    done();
  });
});
```


## Example Projects

- [enzyme-example-lab](https://github.com/gattermeier/enzyme-example-lab)
