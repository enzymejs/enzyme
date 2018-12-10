# Change Log

## 3.8.0

### New Stuff
 - `shallow`/`mount`: add `renderProp` (#1863, #1891)

### Fixes
 - `shallow`/`mount`: improve error message for "single node" assertion (#1904)
 - `shallow`: shallow compare, not deep compare, state and props to determine rerendering (#1915)

### Docs
 - `shallow`: `dive`: add a note about throwing an error (#1905)
 - `selectors: update re `displayName` (#1932)
 - `shallow`: `get`: fixed wrong `props()` usage (#1921)
 - `shallow`: `html`: shallow renders full tree (#1912)
 - Updated broken link for “.hostNodes()” in migration guide from enzyme 2 to 3 (#1909)
 - Add tape example project link (#1898)
 - `prop`: fix typo (#1883)
 - Document full support for attribute selectors (#1881)
 - Documentation update for testing React Native with jsdom (#1873)
 - Update JSDOM docs to include {request|cancel}AnimationFrame polyfills (#1867)
 - `mount`: `ref`: use correct type (#1865)

## 3.7.0

### New Stuff
 - `mount`: `.state()`/`.setState()`: allow calling on children ([#1802](https://github.com/airbnb/enzyme/pull/1802), @ljharb)
 - `configuration`: add `reset` ([commit](https://github.com/airbnb/enzyme/commit/d91d95b8da8900c8f4b7090d2256422a82398ca9))

### Fixes
 - `makeOptions`: ensure that config-level `attachTo`/`hydrateIn` are inherited into wrapper options ([#1836](https://github.com/airbnb/enzyme/issues/1836), @ljharb)
 - `shallow`/`Utils`: call into adapter’s `isCustomComponentElement` if present ([#1832](https://github.com/airbnb/enzyme/pull/1832), @SinHouse)
 - `shallow`/`mount`: throw an explicit error when state is null/undefined ([commit](https://github.com/airbnb/enzyme/commit/9ea33d7667a93885d6f1d6e12b0c2661d6d47cd1))
 - freeze `ROOT_NODES` for child wrappers ([#1811](https://github.com/airbnb/enzyme/pull/1811), @jgzuke)
 - `shallow`: `.parents`: ensure that one `.find` call does not affect another ([#1781](https://github.com/airbnb/enzyme/pull/1781), @ljharb)
 - `mount`: update after `simulateError` ([#1812](https://github.com/airbnb/enzyme/pull/1812), @jgzuke)

### Refactors
 - `mount`/`shallow`: `getElement`: use `this.single` ([commit](https://github.com/airbnb/enzyme/commit/6b63db3b002a419076c82d34554916400ef392fa))

## 3.6.0

### New Stuff
 - `shallow`/`mount`: add `simulateError` ([#1797](https://github.com/airbnb/enzyme/pull/1797), @ljharb)

## 3.5.1

### Fixes
- `shallow`/`mount`: `containsMatchingElement`: trim whitespace ([commit](https://github.com/airbnb/enzyme/commit/171e952), [#636](https://github.com/airbnb/enzyme/issues/636))
- `debug`: inspect objects instead of showing them as `<Component />` ([commit](https://github.com/airbnb/enzyme/commit/a7b6e78))

### Documentation
- `mount`: `ref`: Update docs to be consistent with v3 ([#1242](https://github.com/airbnb/enzyme/pull/1242), @adam-golab)

### Refactors
- `shallow`/`mount`: make tests and method ordering more consistent ([commit](https://github.com/airbnb/enzyme/commit/d0fccaf))
- RSTTraversal: remove unnecessary `adapter` truthiness check ([commit](https://github.com/airbnb/enzyme/commit/394a327))

## 3.5.0

### New Stuff
- Add forwardRef support ([#1592](https://github.com/airbnb/enzyme/pull/1592), @jquense)
- Add Portal support ([#1760](https://github.com/airbnb/enzyme/pull/1760), [#1761](https://github.com/airbnb/enzyme/pull/1760), [#1772](https://github.com/airbnb/enzyme/pull/1772), [#1774](https://github.com/airbnb/enzyme/pull/1774), @jgzuke)
- Add pointer events support ([#1753](https://github.com/airbnb/enzyme/pull/1753), @ljharb)

### Fixes
- preemptively fix compat with React v16.4.3 ([#1790](https://github.com/airbnb/enzyme/pull/1790), [#1778](https://github.com/airbnb/enzyme/pull/1778), @gaearon, @aweary)
- `shallow`: prevent rerenders with PureComponents ([#1786](https://github.com/airbnb/enzyme/pull/1786), @koba04)
- `shallow`: skip updates when nextState is `null` or `undefined` ([#1785](https://github.com/airbnb/enzyme/pull/1785), @koba04)
- `shallow`: `setState` after `setProps` calls `componentWillReceiveProps` ([#1779](https://github.com/airbnb/enzyme/pull/1779), @peanutenthusiast)
- `mount`/`shallow`: be stricter on the wrapper’s setState/setProps callback ([commit](https://github.com/airbnb/enzyme/commit/ff11d2219da575d09ca8edfa19df42b8f78b506f))
- `shallow`/`mount`: improve error message when wrapping invalid elements ([#1759](https://github.com/airbnb/enzyme/pull/1759), @jgzuke)

### Refactors
- remove most uses of lodash ([commit](https://github.com/airbnb/enzyme/commit/89b39b6f1c59aa771f4452a27b159f7aa2616e84))

### Meta Stuff
- ensure a license and readme is present in all packages when published

## 3.4.4

### Fixes
- @koba04: `shallow`: fix unexpected call to componentDidMount ([#1768](https://github.com/airbnb/enzyme/pull/1768))

## 3.4.3

### Fixes
- @ljharb/@koba04: `shallow`: `.setState()`: stub out `setState` on non-root code paths as well ([#1763](https://github.com/airbnb/enzyme/pull/1763))
- @ljharb: `shallow`/`mount`: restore fallback when adapter lacks `invokeSetStateCallback` ([commit](https://github.com/airbnb/enzyme/commit/093b2edb98d3abfe6b61d800503e04aac08e7496))
- @ljharb: `mount`: `setState`: invoke callback with the proper receiver ([commit](https://github.com/airbnb/enzyme/commit/ec3beef3ba86c4352fe6e9ab2848b3b4f61ac1da))
- @ljharb: `mount`: `state` and `setState` should throw an explicit error message when called on an SFC ([commit](https://github.com/airbnb/enzyme/commit/8feee5a89e9091636e9ec0ec3814d287ced20136))

## 3.4.2

### Fixes
- @koba04: `shallow`: call cDU when an instance calls setState ([#1742](https://github.com/airbnb/enzyme/pull/1742))
- @ReactiveRaven: `selectors`: fix descendant selector ([#1680](https://github.com/airbnb/enzyme/pull/1680))

## 3.4.1

### Fixes

- @ljharb: `shallow`: `setProps`: merge instead of replace props ([commit](https://github.com/airbnb/enzyme/commit/9b4d0276f57e54be06aca6c3636120b3c4053310))

### Documentation

- @koba04: Fix an adapter table style in README.md and a migration guide ([#1734](https://github.com/airbnb/enzyme/pull/1734))

## 3.4.0

### New Stuff

- @madicap: `shallow`/`mount`: account for React.Fragment nodes ([#1733](https://github.com/airbnb/enzyme/pull/1733))
- @jquense: Debug: `debugNode` now returns `[function]` for function children ([commit](https://github.com/airbnb/enzyme/commit/9745de0bf25e826186be07e7846f4ecd7c685592))
- @ljharb: `mount`: add `hydrateIn` option ([#1707](https://github.com/airbnb/enzyme/pull/1707))
- @ljharb: `shallow`: add “lifecycles” adapter option ([#1696](https://github.com/airbnb/enzyme/pull/1696))
- @krawaller: `shallow`/`mount`: allow `.exists()` to take an optional selector ([#1695](https://github.com/airbnb/enzyme/pull/1695))
- @koba04: `shallow`: Add getSnapshotBeforeUpdate support ([#1657](https://github.com/airbnb/enzyme/pull/1657))
- @jquense: `shallow`/`mount`: Add support for some pseudo selectors ([#1537](https://github.com/airbnb/enzyme/pull/1537))
- @blainekasten: `debug`: Implement verbose debug output ([#1547](https://github.com/airbnb/enzyme/pull/1547))
- @jquense/@ljharb: `Debug`: `typeName` now calls the adapter’s `displayNameOfNode` if available ([#1701](https://github.com/airbnb/enzyme/pull/1701))
- @jquense/@ljharb: `mount`/`shallow`: `.name()`: call into adapter’s `displayNameOfNode`, if present ([#1701](https://github.com/airbnb/enzyme/pull/1701))
- @jquense/@ljharb: `Utils`: `nodeHasType`: call into adapter’s `displayNameOfNode`, if present ([#1701](https://github.com/airbnb/enzyme/pull/1701))
- @jquense/@ljharb: `selectors`: `buildPredicate`: call into adapter’s `isValidElementType`, if present ([#1701](https://github.com/airbnb/enzyme/pull/1701))
- @emuraton/@ljharb: `shallow`: `setProps()`: Add callback argument ([#1721](https://github.com/airbnb/enzyme/pull/1721))
- @ljharb: `mount`: add `.equals()` ([commit](https://github.com/airbnb/enzyme/commit/dcc8ab10fde06a963364f6cc79b89aa967d9bef2))
- @madicap: Extract `getAdapter` from `Utils` into its own file ([#1732](https://github.com/airbnb/enzyme/pull/1732))

### Fixes

- @ljharb: `shallow`/`mount`: `matchesElement`/`containsMatchingElement`: get adapter with options ([commit](https://github.com/airbnb/enzyme/commit/e954e4610d1ad89ae94b8f7c7baa8835cd331662))
- @ljharb: `RSTTraversal`: remove `nodeHasProperty` export; broken since #1157 ([commit](https://github.com/airbnb/enzyme/commit/edabb1b6b4648fb6469da43feb1d15c1b55666f7))
- @ljharb/@KordonDev: `shallow`: `.at()`: return an empty wrapper when an index does not exist ([#1478](https://github.com/airbnb/enzyme/pull/1478))
- @ljharb: `shallow`: `.equals()`: flatten children when comparing ([commit](https://github.com/airbnb/enzyme/commit/18de4ed2e68c25f9fff9983d996b024704183801))
- @ljharb: `mount`/`shallow`: do not dedupe in flatMap ([commit](https://github.com/airbnb/enzyme/commit/72341740e1e650b16ca2e377fa4e3e144b35a558))
- @ljharb: `shallow`: `.closest()`: ensure an empty wrapper is returned for no match ([commit](https://github.com/airbnb/enzyme/commit/ce1e1132d080948265567e88417dface9c0c45e7))
- @krawaller: `selectors`: make general sibling not throw on root ([#1698](https://github.com/airbnb/enzyme/pull/1698))
- @ljharb/@angelikatyborska : `mount`: `text()`: null nodes return null ([#1582](https://github.com/airbnb/enzyme/pull/1582))
- @ljharb: `shallow`: `simulate`: ensure it returns itself ([commit](https://github.com/airbnb/enzyme/commit/1c2c58b4e554f3b0c5f862f8de79f15a62bef5cf))
- @koba04: `shallow`: ShallowWrapper calls update() automatically ([#1499](https://github.com/airbnb/enzyme/pull/1499))
- @bdwain: `mount`/`shallow`: return null for missing keys ([#1536](https://github.com/airbnb/enzyme/pull/1536))
- @vsiao: Fix ShallowWrapper for array-rendering components ([#1498](https://github.com/airbnb/enzyme/pull/1498))
- @koba04: Call `setState` callback after finishing the render ([#1453](https://github.com/airbnb/enzyme/pull/1453))
- @eddyerburgh: Convert nodes to RST nodes before comparing ([#1423](https://github.com/airbnb/enzyme/pull/1423))
- @ljharb: improve "bad adapter" error message ([#1477](https://github.com/airbnb/enzyme/pull/1477))
- @ljharb: `shallow`/`mount`: default iterator should be iterable ([commit](https://github.com/airbnb/enzyme/commit/cfc5a3e47efa812f7a2c4fa5ad2b0687daacd280))

### Refactors

- @ReactiveRaven: `selectors`: fix typos; avoid reusing variable unnecessarily ([#1681](https://github.com/airbnb/enzyme/pull/1681))
- @koba04/@ljharb: `shallow`: Use `spyMethod` to inspect the result of `shouldComponentUpdate`/`getSnapshotBeforeUpdate` ([#1192](https://github.com/airbnb/enzyme/pull/1192))
- @ljharb: `Utils`: `configuration`: change to named exports. ([commit](https://github.com/airbnb/enzyme/commit/d7f32617e6ea93b739f4e4c3f6228a8e382aeb06))
- @ljharb: use `array.prototype.flat` ([commit](https://github.com/airbnb/enzyme/commit/e52a02ddac0fab0d1d93fd57d7f073f8bdc850bf))

### Documentation

- @jack-lewin: Clarify dev workflow in CONTRIBUTING.md ([#1207](https://github.com/airbnb/enzyme/pull/1207))
- @robrichard: Provide migration instructions for `ref(refName)` ([#1470](https://github.com/airbnb/enzyme/pull/1470))
- @DannyDelott: `shallow`/`mount`: Add callback arg to setProps header ([#1361](https://github.com/airbnb/enzyme/pull/1361))
- @conor-cafferkey-sociomantic: `mount`: Updated docs for ReactWrapper.instance(); remove docs for v2's `getNode()`/`getNodes()` ([#1714](https://github.com/airbnb/enzyme/pull/1714))
- @koba04: Make clearer the docs for .mount() ([#1540](https://github.com/airbnb/enzyme/pull/1540))
- @ialexryan: Update signature of .type() in shallow.md (#1492]([https://github.com/airbnb/enzyme/pull/1492))

### Meta Stuff

- @ljharb: ensure a license and readme is present in all packages when published
- @ljharb: [meta] fix package.json scripts

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
