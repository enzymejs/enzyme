# Change Log

## 1.6.0 (February 10, 2016)

### Minor Changes

- add option for childContextTypes of `ReactWrapper` #171


### Patches

- Prevent null or false nodes from being passed into tree traversal #174

- setProps no longer swallows exceptions #170

- `.type()` and `.props()` should not fail on null now #162



## 1.5.0 (February 2, 2016)

### Minor Changes

- Add `attachTo` option to `mount` to mount to a specific element #160

- Add `.debug()` method to `ReactWrapper` #158

- Add `.mount()` and `.unmount()` APIs to `ReactWrapper` #155

- Add `.render()` method to `ReactWrapper` #156

- Allow `.contains()` to accept an array of nodes #154

- Add `.context()` method to `ReactWrapper` and `ShallowWrapper` #152

### Patches

- Fixed some behavior with `.contains()` matching on strings #148

- Fixed `.debug()`'s output for numeric children #149

- Documentation fixes

- Update versions of dependencies



## 1.4.1 (January 24, 2016)

### Patches

- Upgrade to babel 6 ([#81](https://github.com/airbnb/enzyme/pull/81))

- Fix event naming bug in ShallowWrapper ([#135](https://github.com/airbnb/enzyme/pull/135))

- Documentation fixes


## 1.4.0 (January 21, 2016)

### Minor Changes

- `describeWithDOM` enhancement ([#126](https://github.com/airbnb/enzyme/pull/126))

- add `.equals()` method to `ShallowWrapper` ([#124](https://github.com/airbnb/enzyme/pull/124))

- add object selector syntax ([#110](https://github.com/airbnb/enzyme/pull/110))

### Patches

- Fixed confusing behavior of prop selector syntax ([#130](https://github.com/airbnb/enzyme/pull/130))

- Documentation fixes



## 1.3.1 (January 15, 2016)

### Patches

- Fix setProps not passing old context ([#121](https://github.com/airbnb/enzyme/pull/121))

- Map lowercase mouse events in simulate ([#77](https://github.com/airbnb/enzyme/pull/77))



## 1.3.0 (January 13, 2016)

### Minor Changes

- Added `.html()` method to `ReactWrapper` ([#71](https://github.com/airbnb/enzyme/pull/71))

- Support property selector (i.e. `[prop="foo"]`) ([#70](https://github.com/airbnb/enzyme/pull/70))

- jsdom dependency now allows a range of supported versions ([#95](https://github.com/airbnb/enzyme/pull/95))

### Patches

- Normalized `setProps()` behavior between `mount`/`shallow` to merge props ([#103](https://github.com/airbnb/enzyme/pull/103))

- Exclude `_book` from published package ([#85](https://github.com/airbnb/enzyme/pull/85))

- Various documentation, tests, and style changes


## 1.2.0 (December 10, 2015)

### Minor Changes

- Support for context ([#62](https://github.com/airbnb/enzyme/pull/62))

### Patches

- `nodeHasId` fix for some 0.14 corner cases ([#65](https://github.com/airbnb/enzyme/pull/65))



## 1.1.0 (December 7, 2015)

### Minor Changes

- Support for Stateless Functional Components ([#53](https://github.com/airbnb/enzyme/pull/53))

### Patches

- Tweak `describeWithDOM` messaging ([#48](https://github.com/airbnb/enzyme/pull/48))
- Documentation Fixes




## 1.0.0 (December 3, 2015)

- Official Release!
