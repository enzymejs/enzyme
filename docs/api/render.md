# Static Rendering API

Use enzyme's `render` function to generate HTML from your React tree, and analyze the resulting HTML structure.

`render` returns a wrapper very similar to the other renderers in enzyme, [`mount`](mount.md) and
[`shallow`](shallow.md); however, `render` uses a third party HTML parsing and traversal library
[Cheerio](http://cheeriojs.github.io/cheerio/). We believe that Cheerio handles parsing and
traversing HTML extremely well, and duplicating this functionality ourselves would be a
disservice.

For the purposes of this documentation, we will refer to Cheerio's constructor as
`CheerioWrapper`, which is to say that it is analogous to our `ReactWrapper` and `ShallowWrapper`
constructors. You can reference the [Cheerio API docs](https://github.com/cheeriojs/cheerio#api) for methods available on a `CheerioWrapper` instance.

### Example Usage

```jsx
import React from 'react';
import { render } from 'enzyme';
import PropTypes from 'prop-types';

describe('<Foo />', () => {
  it('renders three `.foo-bar`s', () => {
    const wrapper = render(<Foo />);
    expect(wrapper.find('.foo-bar')).to.have.lengthOf(3);
  });

  it('rendered the title', () => {
    const wrapper = render(<Foo title="unique" />);
    expect(wrapper.text()).to.contain('unique');
  });

  it('renders a div', () => {
    const wrapper = render(<div className="myClass" />);
    expect(wrapper.html()).to.contain('div');
  });

  it('can pass in context', () => {
    function SimpleComponent(props, context) {
      const { name } = context;
      return <div>{name}</div>;
    }
    SimpleComponent.contextTypes = {
      name: PropTypes.string,
    };

    const context = { name: 'foo' };
    const wrapper = render(<SimpleComponent />, { context });
    expect(wrapper.text()).to.equal('foo');
  });
});
```
