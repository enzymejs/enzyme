## Run Tests

`mocha test/adapters/react15Adapter-spec.jsx`

## Renderer

The render method is currently using `const TestUtils = require('react-addons-test-utils');`. I think for mount we'll actually be using `ReactDOM`, but this was what i've been able to get working. We'll then want to be able to take the current state of that rendered markup and turn it into RSTNodes at any given point.
