const Enzyme = require('enzyme');
const Adapter = require('./adapter');
const { wrapper } = require('enzyme-adapter-react-renderer');

Enzyme.configure({ adapter: new Adapter(), wrapper });
