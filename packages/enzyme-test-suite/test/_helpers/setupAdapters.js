const Enzyme = require('enzyme');
const Adapter = require('./adapter');

Enzyme.configure({ adapter: new Adapter() });
