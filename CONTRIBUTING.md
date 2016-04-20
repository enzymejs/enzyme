# Contributing Guide

Contributions are welcome and are greatly appreciated! Every little bit helps, and credit will
always be given.




## Setting up your environment

After forking enzyme to your own github org, do the following steps to get started:

```bash
# clone your fork to your local machine
git clone https://github.com/airbnb/enzyme.git

# step into local repo
cd enzyme

# install dependencies (use react:13 if you want to use React 0.13)
npm install && npm run react:14
```


### Switching between React 15, React 0.14 and React 0.13

```bash
# switch to React 0.13
npm run react:13
```

```bash
# switch to React 0.14
npm run react:14
```

```bash
# switch to React 15
npm run react:15
```


### Running Tests

```bash
# run tests on whatever version of React is currently installed
npm test
```

```bash
# run tests on both React 0.14 and React 0.13
npm run test:all
```

```bash
# faster feedback for TDD
npm run test:watch
```

### Style & Linting

This codebase adheres to the [Airbnb Styleguide](https://github.com/airbnb/javascript) and is
enforced using [ESLint](http://eslint.org/).

It is recommended that you install an eslint plugin for your editor of choice when working on this
codebase, however you can always check to see if the source code is compliant by running:

```bash
npm run lint
```


### Building Docs

Building the docs locally is extremely simple. First execute the following command:

```bash
npm run docs:watch
```

After this, you can open up your browser to the specified port (usually http://localhost:4000 )

The browser will automatically refresh when there are changes to any of the source files.



## Pull Request Guidelines

Before you submit a pull request from your forked repo, check that it meets these guidelines:

1. If the pull request fixes a bug, it should include tests that fail without the changes, and pass
with them.
1. If the pull request adds functionality, the docs should be updated as part of the same PR.
1. The pull request should work for React 15, React 0.14 and React 0.13. The CI server should run the
tests in all versions automatically when you push the PR, but if you'd like to check locally, you
can do so (see above).
1. Please rebase and resolve all conflicts before submitting.

