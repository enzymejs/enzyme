# `.key() => String`

Returns the key value for the node of the current wrapper. It must be a single-node wrapper.

#### Example


```jsx
const wrapper = mount((
  <ul>
    {['foo', 'bar'].map(s => <li key={s}>{s}</li>)}
  </ul>
)).find('li');
expect(wrapper.at(0).key()).to.equal('foo');
expect(wrapper.at(1).key()).to.equal('bar');
```
