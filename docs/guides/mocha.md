# Using Enzyme with Mocha

```bash
npm i --save-dev enzyme-mocha
```

```jsx
import { mount } from 'enzyme';
import { describeWithDOM } from 'enzyme-mocha';

describe('<Foo />', () => {

  it('calls componentDidMount', () => {
    spy(Foo.prototype, 'componentDidMount');
    const wrapper = mount(<Foo />);
    expect(Foo.prototype.componentDidMount.calledOnce).to.be.true;
  });
  
});

```
