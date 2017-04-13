# Static Rendering API

Enzyme's `render` function is used to render react components to static HTML and analyze the
resulting HTML structure.

`render` returns a wrapper very similar to the other renderers in enzyme, [`mount`](mount.md) and
[`shallow`](shallow.md); however, `render` uses a third party HTML parsing and traversal library
[Cheerio](http://cheeriojs.github.io/cheerio/). We believe that Cheerio handles parsing and
traversing HTML extremely well, and duplicating this functionality ourselves would be a
disservice.

For the purposes of this documentation, we will refer to Cheerio's constructor as
`CheerioWrapper`, which is to say that it is analogous to our `ReactWrapper` and `ShallowWrapper`
constructors.

### Example Usage

```jsx
import React from 'react';
import { render } from 'enzyme';
import PropTypes from 'prop-types';

describe('<Foo />', () => {
  it('renders three `.foo-bar`s', () => {
    const wrapper = render(<Foo />);
    expect(wrapper.find('.foo-bar')).to.have.length(3);
  });

  it('rendered the title', () => {
    const wrapper = render(<Foo title="unique" />);
    expect(wrapper.text()).to.contain("unique");
  });

  it('can pass in context', () => {
    class SimpleComponent extends React.Component {
      render() {
        return <div>{this.context.name}</div>;
      }
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
