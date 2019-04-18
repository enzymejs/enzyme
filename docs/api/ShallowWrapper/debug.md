# `.debug([options]) => String`

Returns an HTML-like string of the wrapper for debugging purposes. Useful to print out to the
console when tests are not passing when you expect them to.


#### Arguments

`options` (`Object` [optional]):
- `options.ignoreProps`: (`Boolean` [optional]): Whether props should be omitted in the resulting string. Props are included by default.
- `options.verbose`: (`Boolean` [optional]): Whether arrays and objects passed as props should be verbosely printed.

#### Returns

`String`: The resulting string.



#### Examples
```jsx
function Book({ title, pages }) {
  return (
    <div>
      <h1 className="title">{title}</h1>
      {pages && (
        <NumberOfPages
          pages={pages}
          object={{ a: 1, b: 2 }}
        />
      )}
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
  <NumberOfPages pages="633 pages" object={{...}}/>
</div>
```

```jsx
const wrapper = shallow((
  <Book
    title="Huckleberry Finn"
    pages="633 pages"
  />
));
console.log(wrapper.debug({ ignoreProps: true }));
```
Outputs to console:
```text
<div>
  <h1>Huckleberry Finn</h1>
  <NumberOfPages />
</div>
```


```jsx
const wrapper = shallow((
  <Book
    title="Huckleberry Finn"
    pages="633 pages"
  />
));
console.log(wrapper.debug({ verbose: true }));
```
Outputs to console:
```text
<div>
  <h1 className="title">Huckleberry Finn</h1>
  <NumberOfPages pages="633 pages" object={{ a: 1, b: 2 }}/>
</div>
```
