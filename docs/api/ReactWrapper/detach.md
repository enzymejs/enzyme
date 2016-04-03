# `.detach() => void`

Detaches the react tree from the DOM. Runs `ReactDOM.unmountComponentAtNode()` under the hood.

This method will most commonly be used as a "cleanup" method if you decide to use the
`attachTo` option in `mount(node, options)`.

The method is intentionally not "fluent" (in that it doesn't return `this`) because you should
not be doing anything with this wrapper after this method is called.

Using the `attachTo` is not generally recommended unless it is absolutely necessary to test
something.  It is your responsibility to clean up after yourself at the end of the test if you do
decide to use it, though.


#### Examples


With the `attachTo` option, you can mount components to attached DOM elements:
```jsx
// render a component directly into document.body
const wrapper = mount(<Bar />, { attachTo: document.body });

// we can see that the component is rendered into the document
expect(wrapper.find('.in-bar')).to.have.length(1);
expect(document.body.childNodes).to.have.length(1);

// detach it to clean up after yourself
wrapper.detach();

// now we can see that
expect(document.body.childNodes).to.have.length(0);
```

Similarly, if you want to create some one-off elements for your test to mount into:
```jsx
// create a div in the document to mount into
const div = global.document.createElement('div');
global.document.body.appendChild(div);

// div is empty. body has the div attached.
expect(document.body.childNodes).to.have.length(1);
expect(div.childNodes).to.have.length(0);

// mount a component passing div into the `attachTo` option
const wrapper = mount(<Foo />, { attachTo: div });

// we can see now the component is rendered into the document
expect(wrapper.find('.in-foo')).to.have.length(1);
expect(document.body.childNodes).to.have.length(1);
expect(div.childNodes).to.have.length(1);

// call detach to clean up
wrapper.detach();

// div is now empty, but still attached to the document
expect(document.body.childNodes).to.have.length(1);
expect(div.childNodes).to.have.length(0);

// remove div if you want
global.document.body.removeChild(div);

expect(document.body.childNodes).to.have.length(0);
expect(div.childNodes).to.have.length(0);
```
