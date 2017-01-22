# Change Log

## 2.7.1 (January 22, 2017)

### Fixes

- `mount`: Fix bug from ([#677](https://github.com/airbnb/enzyme/pull/677) ([#680](https://github.com/airbnb/enzyme/pull/680)
- `mount`: ignore text nodes in childrenOfInst ([#604](https://github.com/airbnb/enzyme/pull/604)

### Documentation

- Update Docs for .getNode and .getNodes ([#743](https://github.com/airbnb/enzyme/pull/743)
- Add a link for `ShallowWrapper#dive()` ([#759](https://github.com/airbnb/enzyme/pull/759)
- Fix alphabetical order of API lists ([#761](https://github.com/airbnb/enzyme/pull/761)

## 2.7.0 (December 21, 2016)

### New Stuff

- `shallow`/`mount`: Add `.slice()` method ([#661](https://github.com/airbnb/enzyme/pull/661))
- `mount`: implement ReactWrapper#getDOMNode ([#679](https://github.com/airbnb/enzyme/pull/679))
- `shallow`/`mount`: Add `exists`; deprecate isEmpty() ([#722](https://github.com/airbnb/enzyme/pull/722))

### Fixes

- `mount`: extract MountedTraversal.hasClassName from MountedTraversal.instHasClassName, which allows ReactWrapper.hasClass to bypass the !isDOMComponent(inst) call ([#677](https://github.com/airbnb/enzyme/pull/677)
- `withDom`: Display a useful error when `withDom` fails to find "jsdom" ([#686](https://github.com/airbnb/enzyme/pull/686))
- `mount`: ensure that `react-text` comment nodes don’t break `.find` ([#691](https://github.com/airbnb/enzyme/pull/691))
- `mount`: `.parents()` now filters out sibling path trees ([#713](https://github.com/airbnb/enzyme/pull/713))

## 2.6.0 (November 9, 2016)

### New Stuff

- ensure ShallowWrapper render output can't get stale ([#490](https://github.com/airbnb/enzyme/pull/490))

### Fixes

- Use shim to detect constructor function name ([#659](https://github.com/airbnb/enzyme/pull/659))
- `mount`/`shallow`: fix ID selectors ([#670](https://github.com/airbnb/enzyme/pull/670))


## 2.5.2 (November 9, 2016)

### Fixes

- Use shim to detect constructor function name ([#659](https://github.com/airbnb/enzyme/pull/659))
- `mount`/`shallow`: fix ID selectors ([#670](https://github.com/airbnb/enzyme/pull/670))


## 2.5.1 (October 17, 2016)

### Patches

- continue to support one-argument `single` ([#632](https://github.com/airbnb/enzyme/pull/632))


## 2.5.0 (October 17, 2016)

### Minor Changes

- pass callback on setState and setProps ([#617](https://github.com/airbnb/enzyme/pull/617))

- Make ReactWrapper and ShallowWrapper iterable ([#594](https://github.com/airbnb/enzyme/pull/594))

- add `.dive()` method to `shallow` ([#618](https://github.com/airbnb/enzyme/pull/618))


### Patches

- Warn if selector contains a pseudo-class ([#591](https://github.com/airbnb/enzyme/pull/591))

- change isCompoundSelector to not match prop selector ([#595](https://github.com/airbnb/enzyme/pull/595))

- fixed hasClassName in case className is not a string and has toString method ([#518](https://github.com/airbnb/enzyme/pull/518))

- Throw if some() is called on a root wrapper ([#523](https://github.com/airbnb/enzyme/pull/523))

- Fix valid + falsy propvalues ([#563](https://github.com/airbnb/enzyme/pull/563))


## 2.4.2 (November 9, 2016)

### Fixes

- Use shim to detect constructor function name ([#659](https://github.com/airbnb/enzyme/pull/659))
- `mount`/`shallow`: fix ID selectors ([#670](https://github.com/airbnb/enzyme/pull/670))


## 2.4.1 (July 8, 2016)

### Patches

- Fix backwards incompatible `shouldComponentUpdate` call ([#491](https://github.com/airbnb/enzyme/pull/491))


## 2.4.0 (July 7, 2016)

### Minor Changes

- Support all Component Lifecycle methods in ShallowRenderer (behind an experimental flag) ([#318](https://github.com/airbnb/enzyme/pull/318))

- Add an `isEmptyRender()` method to both `ShallowWrapper` and `ReactWrapper` ([#339](https://github.com/airbnb/enzyme/pull/339))

- Add support for batched updates with `ShallowRender.simulate` ([#342](https://github.com/airbnb/enzyme/pull/342))


### Patches

- Switch to using classList instead of className ([#448](https://github.com/airbnb/enzyme/pull/448))

- fixes mount().debug() output with mixed children ([#476](https://github.com/airbnb/enzyme/pull/476))

- Support additional characters in attribute selectors ([#412](https://github.com/airbnb/enzyme/pull/412))

- fix id selector not working when combined with a tag selector ([#387](https://github.com/airbnb/enzyme/pull/387))

- Support spaces in attribute selector values ([#427](https://github.com/airbnb/enzyme/pull/427))



## 2.3.0 (May 9, 2016)

### Minor Changes

- add `.tap()` method to `ShallowWrapper` and `ReactWrapper` ([#299](https://github.com/airbnb/enzyme/pull/299))

- add `.key()` method to `ShallowWrapper` and `ReactWrapper` ([#327](https://github.com/airbnb/enzyme/pull/327))

- add support for descendent selectors, `>`, `~` and `+` ([#217](https://github.com/airbnb/enzyme/pull/217))

- new `containsMatchingElement`, `containsAllMatchingElements`, and `containsAnyMatchingElements` APIs ([#362](https://github.com/airbnb/enzyme/pull/362))

- new `.name()` method ([#335](https://github.com/airbnb/enzyme/pull/335))


### Patches

- add `dblclick` to eventType map for simulate ([#317](https://github.com/airbnb/enzyme/pull/317))

- fix `pathToNode` bug with child-containing children ([#296](https://github.com/airbnb/enzyme/pull/296))

- prioritize `displayName` over `name` for consistency in `.debug()` ([#332](https://github.com/airbnb/enzyme/pull/332))

- handle insignificant whitespace in className ([#348](https://github.com/airbnb/enzyme/pull/348))

- fix handling of SFC components and `.instance()` ([#359](https://github.com/airbnb/enzyme/pull/359))

- reduce false positives by using argument validation for `.contains` ([#259](https://github.com/airbnb/enzyme/pull/259)) 

- fix equality algorithm so that non-renderable nodes are equivalent ([#192](https://github.com/airbnb/enzyme/pull/192))

- add better error handling for `state`, `setState`, and `context` ([#373](https://github.com/airbnb/enzyme/pull/373))




## 2.2.0 (March 21, 2016)

### Minor Changes

- add `options` param to `ShallowWrapper::shallow` ([#275](https://github.com/airbnb/enzyme/pull/275))


### Patches

- make enzyme compatible with all React 15 RCs ([#272](https://github.com/airbnb/enzyme/pull/272))

- increase coverage for Stateless Functional Components ([#267](https://github.com/airbnb/enzyme/pull/267))

- improve context support for Stateless Functional Components ([#256](https://github.com/airbnb/enzyme/pull/256))

- fix tree traversal for Stateless Functional Components ([#257](https://github.com/airbnb/enzyme/pull/257))

- fix `.find` for nested Stateless Functional Components ([#274](https://github.com/airbnb/enzyme/pull/274))

- fix `.props()` and `.debug()` methods for Stateless Functional Components ([#255](https://github.com/airbnb/enzyme/pull/255))

- prevent falsy nodes from being counted as children ([#251](https://github.com/airbnb/enzyme/pull/251))


## 2.1.0 (March 10, 2016)

### Minor Changes

- add support for React 15.0.0-rc.1 ([#240](https://github.com/airbnb/enzyme/pull/240))

- add `.unmount()` method for ShallowWrapper ([#215](https://github.com/airbnb/enzyme/pull/215))

- add direct imports for `mount`, `shallow`, and `render` ([#198](https://github.com/airbnb/enzyme/pull/198))

- add a `.childAt(n)` shorthand method ([#187](https://github.com/airbnb/enzyme/pull/187))


### Patches

- fix bug in .contains() for matching sub-arrays ([#226](https://github.com/airbnb/enzyme/pull/226))

- fix bug in matching by type displayName ([#230](https://github.com/airbnb/enzyme/pull/230))

- add more useful warnings for missing implicit dependencies ([#228](https://github.com/airbnb/enzyme/pull/228))

- improve SFC support for `.type()` ([#196](https://github.com/airbnb/enzyme/pull/196))

- fix null handling for `.html()` and `.render()` ([#196](https://github.com/airbnb/enzyme/pull/196))

- moved from `underscore` to `lodash` ([#189](https://github.com/airbnb/enzyme/pull/189))


## 2.0.0 (February 10, 2016)

### Major Changes (breaking)

- removed `describeWithDOM` utility ([#159](https://github.com/airbnb/enzyme/pull/159))

- removed `useSinon`, `spyPrototype` and `spyLifecycle` utilities ([#159](https://github.com/airbnb/enzyme/pull/159))

- removed `sinon` dependency ([#159](https://github.com/airbnb/enzyme/pull/159))

- removed `jsdom` dependency ([#159](https://github.com/airbnb/enzyme/pull/159))


## 1.6.0 (February 10, 2016)

### Minor Changes

- add option for childContextTypes of `ReactWrapper` ([#171](https://github.com/airbnb/enzyme/pull/171))


### Patches

- Prevent null or false nodes from being passed into tree traversal ([#174](https://github.com/airbnb/enzyme/pull/174))

- setProps no longer swallows exceptions ([#170](https://github.com/airbnb/enzyme/pull/170))

- `.type()` and `.props()` should not fail on null now ([#162](https://github.com/airbnb/enzyme/pull/162))



## 1.5.0 (February 2, 2016)

### Minor Changes

- Add `attachTo` option to `mount` to mount to a specific element ([#160](https://github.com/airbnb/enzyme/pull/160))

- Add `.debug()` method to `ReactWrapper` ([#158](https://github.com/airbnb/enzyme/pull/158))

- Add `.mount()` and `.unmount()` APIs to `ReactWrapper` ([#155](https://github.com/airbnb/enzyme/pull/155))

- Add `.render()` method to `ReactWrapper` ([#156](https://github.com/airbnb/enzyme/pull/156))

- Allow `.contains()` to accept an array of nodes ([#154](https://github.com/airbnb/enzyme/pull/154))

- Add `.context()` method to `ReactWrapper` and `ShallowWrapper` ([#152](https://github.com/airbnb/enzyme/pull/152))

### Patches

- Fixed some behavior with `.contains()` matching on strings ([#148](https://github.com/airbnb/enzyme/pull/148))

- Fixed `.debug()`'s output for numeric children ([#149](https://github.com/airbnb/enzyme/pull/149))

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
