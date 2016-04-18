# Using Enzyme with Lab and Code

[Lab](https://github.com/hapijs/lab) is a simple test utility for node & part of the [Hapi.js](https://github.com/hapijs/hapi) framework universe. Lab's initial code borrowed heavily from [Mocha](https://github.com/mochajs/mocha). [Code](https://github.com/hapijs/code) is Lab's standard assertion library and was created as a direct rewrite of [Chai](https://github.com/chaijs).


# Example Test: Enzyme + Lab + Code

```jsx
const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
import { shallow, mount, render } from 'enzyme';
import React from 'react';

lab.suite('A suite', () => {
  lab.test("calls componentDidMount", (done) => {
    const wrapper = mount(<Foo />);
    Code.expect(Foo.prototype.componentDidMount.calledOnce).to.equal(true);
    done();
  });
});

```


## Example Projects

- [enzyme-example-lab](https://github.com/gattermeier/enzyme-example-lab)
