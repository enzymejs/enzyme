# `.debug() => String`

Returns an HTML-like string of the wrapper for debugging purposes. Useful to print out to the
console when tests are not passing when you expect them to.


#### Returns

`String`: The resulting string.



#### Examples
```jsx
function Book({ title, pages }) {
  return (
    <div>
      <h1 className="title">{title}</h1>
      {pages && <NumberOfPages pages={pages} />}
    </div>
  );
}
Book.propTypes = {
  title: PropTypes.string.isRequired,
  pages: PropTypes.number,
};
Book.defaultProps = {
  pages: null,
};
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
const wrapper = shallow((
  <Book
    title="Huckleberry Finn"
    pages="633 pages"
  />
));
console.log(wrapper.debug());
```
Outputs to console:
```text
<div>
 <h1 className="title">Huckleberry Finn</h1>
 <NumberOfPages pages="633 pages" />
</div>
```
