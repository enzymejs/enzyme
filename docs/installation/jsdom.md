# Working with jsdom & `mount`

If you plan on using `mount`, it requires jsdom. Jsdom requires node 4 or above. As a result, if
you want to use `mount`, you will need to make sure node 4 or iojs is on your machine.


### Switching between node versions

Some times you may need to switch between different versions of node, you can use a CLI tool called
`nvm` to quickly switch between node versions.

To install NVM:

```bash
brew install nvm
nvm install 4
```

Now your machine will be running Node 4. You can use the `nvm use` command to switch between the two
environments:

```bash
nvm use 0.12
```

```bash
nvm use 4
```

### Preventing tests from failing on old versions

If you are worried about tests not passing on versions of node that don't support jsdom, Enzyme
comes with a helper function to wrap your tests in a safety layer such that any tests written
inside of that function will be skipped if jsdom is not available.  (Note that this is for mocha
only).

```jsx
import { mount, shallow } from 'enzyme';

describe('MyComponent', () => {
  describeWithDOM('interaction', () => {
    // these tests will get skipped if jsdom is not available...
    it('should do something', () => {
      const wrapper = mount(<MyComponent />);
      // ...
    });
  });
  describe('non-interaction', () => {
    // these tests will always run
    it('should do something', () => {
      const wrapper = shallow(<MyComponent />);
      // ...
    });
  });
});

```
