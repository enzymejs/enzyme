# `.slice([begin[, end]]) => ShallowWrapper`

Returns a new wrapper with a subset of the nodes of the original wrapper, according to the rules of `Array#slice`.


#### Arguments

1. `begin` (`Number` [optional]): Index from which to slice (defaults to `0`). If negative, this is treated as `length+begin`.
1. `end` (`Number` [optional]): Index at which to end slicing (defaults to `length`). If negative, this is treated as `length+end`.



#### Returns

`ShallowWrapper`: A new wrapper with the subset of nodes specified.



#### Examples

```jsx
const wrapper = shallow(
<div>
  <div className="foo bax" />
  <div className="foo bar" />
  <div className="foo baz" />
</div>
);
expect(wrapper.find('.foo').slice(1)).to.have.length(2);
expect(wrapper.find('.foo').slice(1).at(0).hasClass('bar')).to.equal(true);
expect(wrapper.find('.foo').slice(1).at(1).hasClass('baz')).to.equal(true);
```

```jsx
const wrapper = shallow(
<div>
  <div className="foo bax" />
  <div className="foo bar" />
  <div className="foo baz" />
</div>
);
expect(wrapper.find('.foo').slice(1, 2)).to.have.length(1);
expect(wrapper.find('.foo').slice(1, 2).at(0).hasClass('bar')).to.equal(true);
```
