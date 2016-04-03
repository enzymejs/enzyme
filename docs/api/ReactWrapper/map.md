# `.map(fn) => Array<Any>`

Maps the current array of nodes to another array. Each node is passed in as a `ReactWrapper`
to the map function.


#### Arguments

1. `fn` (`Function ( ReactWrapper node ) => Any`): A mapping function to be run for every node in
the collection, the results of which will be mapped to the returned array. Should expect a ReactWrapper as the first argument, and will be run with a context of
the original instance.



#### Returns

`Array<Any>`: Returns an array of the returned values from the mapping function..



#### Example

```jsx
const wrapper = mount(
  <div>
    <div className="foo">bax</div>
    <div className="foo">bar</div>
    <div className="foo">baz</div>
  </div>
);

const texts = wrapper.find('.foo').map(node => node.text());
expect(texts).to.eql([ 'bax', 'bar', 'baz' ]);
```


#### Related Methods

- [`.forEach(fn) => ReactWrapper`](forEach.md)
- [`.reduce(fn[, initialValue]) => Any`](reduce.md)
- [`.reduceRight(fn[, initialValue]) => Any`](reduceRight.md)
