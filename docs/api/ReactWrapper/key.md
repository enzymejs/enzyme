# `.key() => String`

Returns the key value for the node of the current wrapper.

NOTE: can only be called on a wrapper of a single node.

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
