# `.debug() => String`

Returns an HTML-like string of the wrapper for debugging purposes. Useful to print out to the
console when tests are not passing when you expect them to.


#### Returns

`String`: The resulting string.



#### Examples
```jsx
class Book extends React.Component {
  render() {
    const { title, cover } = this.props;
    return (
      <div>
        <h1 className="title"">{title}</h1>
        {cover && <BookCover cover={cover} />}
      </div>
    );
  }
}

```
```jsx
const wrapper = shallow(<Book title="Huckleberry Finn" />);
console.log(wrapper.debug());
```
Outputs to console:
```text
<div>
 <h1 className="title">Huckleberry Finn</h1>
</div>
```

```jsx
const wrapper = shallow(
  <Book
    title="Huckleberry Finn"
    cover={{
      url: 'http://some.url/to/img.png',
      width: 40,
      height: 80
    }}
  />
);
console.log(wrapper.debug());
```
Outputs to console:
```text
<div>
 <h1 className="title">Huckleberry Finn</h1>
 <BookCover cover={{...}} />
</div>
```
