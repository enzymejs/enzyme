# Change Log

## 3.3.0

### New Stuff

- @ljharb/@joeldenning: `debug`: handle boxed primitives ([#1450](https://github.com/airbnb/enzyme/pull/1450))

### Refactors
- @eddyerburgh: Use RSTTraversal childrenOfNode in Utils ([#1381](https://github.com/airbnb/enzyme/pull/1381))

### Fixes
- @nicoder: Fix typo in error message ([#1379](https://github.com/airbnb/enzyme/pull/1379))

## 3.2.0

### New Stuff

- @aweary: Support all attribute selector operators ([#1157](https://github.com/airbnb/enzyme/pull/1157))

### Fixes

- @idanilt: Change ShallowWrapper.text() trim spaces with same behavior as ReactWrapper.text() ([#1350](https://github.com/airbnb/enzyme/pull/1350))

## 3.1.1

### Fixes

- @koba04: Fix to call componentDidUpdate on setState of React v16 ([#1261](https://github.com/airbnb/enzyme/pull/1261))

## 3.1.0

### New Stuff

- @FezVrasta: Added hostNodes method to ReactWrapper ([#1179](https://github.com/airbnb/enzyme/pull/1179))

### Fixes

- @lelandrichardson: Add an npmignore file to all packages ([#1204](https://github.com/airbnb/enzyme/pull/1204))

- @neoziro: Fix node resolving in React 16 adapter ([#100](https://github.com/airbnb/enzyme/pull/100))

- @graingert: upgrade to rst-selector-parser@^2.2.2 ([#1146](https://github.com/airbnb/enzyme/pull/1146))

### Documentation

- @lelandrichardson: Symlink readme to all packages ([#1205](https://github.com/airbnb/enzyme/pull/1205))

- @AndersDJohnson: fix some typos ([#1165](https://github.com/airbnb/enzyme/pull/1165))

- @dubbha: ES5 setup file correction ([#1194](https://github.com/airbnb/enzyme/pull/1194))

- @morrowr08: updated component name being used in example ([#1180](https://github.com/airbnb/enzyme/pull/1180))

- @apandichi: Fixing a few typos... ([#1171](https://github.com/airbnb/enzyme/pull/1171))

- @nuc: Fix typo ([#1142](https://github.com/airbnb/enzyme/pull/1142))

## 3.0.0

### Breaking Changes

Enzyme has several breaking changes from v2 to v3. Please check out our [migration guide](/docs/guides/migration-from-2-to-3.md) for more info. Since there was a rewrite of the core
library from v2 to v3, it is hard to categorize changes in terms of sem

 - @lelandrichardson: Refactor enzyme to use Adapters, initial React 16 support ([#1007](https://github.com/airbnb/enzyme/pull/1007))

 - @lelandrichardson: Make private properties more private and harder to use ([#1083](https://github.com/airbnb/enzyme/pull/1083))

 - @ljharb: [breaking] update `cheerio` to v1 ([#1093](https://github.com/airbnb/enzyme/pull/1093))

 - @aweary: Integrate with a CSS parser for selector parsing ([#1086](https://github.com/airbnb/enzyme/pull/1086))

 - @vadimdemedes: Skip undefined props when comparing nodes ([#662](https://github.com/airbnb/enzyme/pull/662))

 - @koba04: Breaking: lifecycleExperimental by default ([#1140](https://github.com/airbnb/enzyme/pull/1140))


### New Stuff

 - @lelandrichardson: Move to lerna repo structure, multiple modules ([#1074](https://github.com/airbnb/enzyme/pull/1074))

 - @lelandrichardson: Remove all React dependencies from enzyme ([#1084](https://github.com/airbnb/enzyme/pull/1084))

 - @lelandrichardson: Add public root method ([#1127](https://github.com/airbnb/enzyme/pull/1127))



 ### Fixes

 - @aweary: Remove isFunctionalComponent, use nodeType instead ([#1076](https://github.com/airbnb/enzyme/pull/1076))

 - @LarsHassler: props not merged when shallow rendering in lifecycleExperimental ([#1088](https://github.com/airbnb/enzyme/pull/1088))

 - @ljharb: [Fix] `mount`: do not mutate `Component.contextTypes` ([#1099](https://github.com/airbnb/enzyme/pull/1099))

 - @ljharb: [Fix] `reduce`/`reduceRight`: follow `Array#reduce` when omitting initialValue ([#673](https://github.com/airbnb/enzyme/pull/673))

 - @koba04: Fix componentDidUpdate when updating by setState on v16 ([#1133](https://github.com/airbnb/enzyme/pull/1133))

 - @koba04: Fix componentDidUpdate no longer receives prevContext on React v16 ([#1139](https://github.com/airbnb/enzyme/pull/1139))



 ### Documentation

 - @ghost: added sinon to mocha guide ([#1075](https://github.com/airbnb/enzyme/pull/1075))

 - @samit4me: Update to GitBook 3 ([#1039](https://github.com/airbnb/enzyme/pull/1039))

 - @therewillbecode: Removed extraneous brackets from example in readme ([#1117](https://github.com/airbnb/enzyme/pull/1117))

 - @silvenon: Add note that mount() requires cleanup ([#1043](https://github.com/airbnb/enzyme/pull/1043))

 - @lelandrichardson: Add docs reflecting v3 ([#1121](https://github.com/airbnb/enzyme/pull/1121))




## 2.9.1

### Fixes

 - [Deps] Require uuid at least 3.0.1 ([#1001](https://github.com/airbnb/enzyme/pull/1001))

## 2.9.0

### New Stuff

 - `mount`/`shallow`: `debug`: add `ignoreProps` option ([#960](https://github.com/airbnb/enzyme/pull/960))

### Fixes

 - `shallow`: debug: fix indentation ([#926](https://github.com/airbnb/enzyme/pull/926))
 - react-compat: Make sure dependency error reporting always work ([#929](https://github.com/airbnb/enzyme/pull/929))
 - react-compat: correct error message ([#904](https://github.com/airbnb/enzyme/pull/904))

### Documentation

 - lint our markdown ([#988](https://github.com/airbnb/enzyme/pull/988))
 - correct `nvm` install instructions (never install it with homebrew) ([#988](https://github.com/airbnb/enzyme/pull/988))
 - fix typos ([#979](https://github.com/airbnb/enzyme/pull/979)), ([#983](https://github.com/airbnb/enzyme/pull/983))
 - Added missing isEmptyRender() docs
 - update jsdom guides for v10 and later ([#921](https://github.com/airbnb/enzyme/pull/921))

### Refactors

 - `shallow`/`mount`: Make all references to the wrapper `class` call into `this.wrap`
 - update `uuid` from v2 to v3 ([#998](https://github.com/airbnb/enzyme/pull/998))

## 2.8.2

### Fixes

 - Loosen react-compat implicit dependency logic for React 15.4 ([#896](https://github.com/airbnb/enzyme/pull/896))

### Documentation

 - Update docs to use `prop-types` ([#894](https://github.com/airbnb/enzyme/pull/894), [#890](https://github.com/airbnb/enzyme/issue/890))

## 2.8.1

### Fixes

- support React@15.5 ([#876](https://github.com/airbnb/enzyme/pull/876))
- no longer depend on `React.createClass` ([#877](https://github.com/airbnb/enzyme/pull/877))
- Throw for malformed compound selectors ([#868](https://github.com/airbnb/enzyme/pull/868))

## 2.8.0

### New Stuff

- add disableLifecycleMethods for shallow ([#789](https://github.com/airbnb/enzyme/pull/789))
- Match children before and after interpolation ([#512](https://github.com/airbnb/enzyme/pull/512))
- Supporting passing context to static rendering ([#429](https://github.com/airbnb/enzyme/pull/429))


### Fixes

- Fix an issue w/ cleaning up global.document ([#855](https://github.com/airbnb/enzyme/pull/855))
- Update props when shouldComponentUpdate returns `false` and `lifecycleExperimental` is on ([#807](https://github.com/airbnb/enzyme/pull/807))
- Properly pass along options in `dive` ([#771](https://github.com/airbnb/enzyme/pull/771))

## 2.7.1 (January 22, 2017)

### Fixes

- `mount`: Fix bug from ([#677](https://github.com/airbnb/enzyme/pull/677) ([#680](https://github.com/airbnb/enzyme/pull/680))
- `mount`: ignore text nodes in childrenOfInst ([#604](https://github.com/airbnb/enzyme/pull/604))

### Documentation

- Update Docs for .getNode and .getNodes ([#743](https://github.com/airbnb/enzyme/pull/743))
- Add a link for `ShallowWrapper#dive()` ([#759](https://github.com/airbnb/enzyme/pull/759)
- Fix alphabetical order of API lists ([#761](https://github.com/airbnb/enzyme/pull/761))

## 2.7.0 (December 21, 2016)

### New Stuff

- `shallow`/`mount`: Add `.slice()` method ([#661](https://github.com/airbnb/enzyme/pull/661))
- `mount`: implement ReactWrapper#getDOMNode ([#679](https://github.com/airbnb/enzyme/pull/679))
- `shallow`/`mount`: Add `exists`; deprecate isEmpty() ([#722](https://github.com/airbnb/enzyme/pull/722))

### Fixes

- `mount`: extract MountedTraversal.hasClassName from MountedTraversal.instHasClassName, which allows ReactWrapper.hasClass to bypass the !isDOMComponent(inst) call ([#677](https://github.com/airbnb/enzyme/pull/677))
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
