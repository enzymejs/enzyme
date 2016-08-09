# Using Enzyme with Fluxible

Testing Fluxible higher-order components using Enzyme and Sinon.

First, setup jsdom so we can use Enzyme mount.

```js
/* setup.js */

var jsdom = require('jsdom').jsdom;
var exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};
```

Next, setup mock context and childContextTypes objects.

```js
/* testHelper.js */
import {PropTypes} from 'react'

const mockContext = {
  executeAction: (action, data) => {},
  getStore: (store) => {
    return {
      on: () => {}
    }
  }
};

const mockChildContextTypes = {
  getStore: PropTypes.func,
  executeAction: PropTypes.func,
  dispatcherContext: PropTypes.func,
  executeActionCalls: PropTypes.array
};
```
Our fluxible component is displaying data from the store, props and context.

```js
/* TestCompoent.js */
class Test extends React.Component {

  static contextTypes = {
    executeAction: React.PropTypes.func,
    getStore: React.PropTypes.func,
    contextData: React.PropTypes.string
  };
  static propsTypes = {
    message: React.PropTypes.string
  };
  constructor(props){
     super(props);
     this.state = {foo: ''};
  }
  render() {
    if(this.props.getMessageFromStore){
      return (

        <div>
          <div>{this.props.message}</div>
          <div>{this.props.getMessageFromStore}</div>
          <div>{this.context.contextData}</div>
        </div>

      );
    }
    return null;
  }
}

Test = connectToStores(Test, [TestStore], (context, props) => ({
    getMessageFromStore: context.getStore(TestStore).getMessage()
}));
export default Test;
```
The test uses sinon to stub the compoent's getStateFromStores function, allowing us
to return the mock data.  This test also show mocking out props and context.

```js
/* TestComponent.spec.js */

  describe('#<TestComponent/>', () => {
    let sandbox;

    // create a sinon sandbox
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    // restore stubs/spys
    afterEach (() => {
      sandbox.restore();
    });

    it('should render a divs for props, store data and context', () => {

        const props = {      // props to send to the component
          message: 'hello'
        }
        const mockData = 'world';   // data returned from store

        const mockContextData = 'fakecontext';  //context to send to component

        sandbox.stub(Test.prototype, 'getStateFromStores')   // stub getStateFromStores wth mock data
          .returns({getMessageFromStore:  mockData});

        const wrapper = mount(<Test {...props}/>, {
          context: Object.assign( {}, mockContext, {contextData: mockContextData}),
          childContextTypes: Object.assign( {}, mockChildContextTypes, {contextData: React.PropTypes.string})
        });

        expect(wrapper.containsMatchingElement(<div>{props.message}</div>)).to.equal(true);
        expect(wrapper.containsMatchingElement(<div>{mockData}</div>)).to.equal(true);
        expect(wrapper.containsMatchingElement(<div>{mockContextData}</div>)).to.equal(true);
    });
  });

```

## Example Projects

- [fluxible-unittest](https://github.com/jsmey/fluxible-unittest)
