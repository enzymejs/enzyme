# `.tap(intercepter) => Self`

Invokes intercepter and returns itself. intercepter is called with itself.
This is helpful when debugging nodes in method chains.

#### Arguments

1. `intercepter` (`Self`): the current ReactWrapper instance.



#### Returns

`Self`: the current ReactWrapper instance.



#### Example


```jsx
const result = mount((
  <ul>
    <li>xxx</li>
    <li>yyy</li>
    <li>zzz</li>
  </ul>
))
.find('li')
.tap(n => console.log(n.debug()))
.map(n => n.text());
```
