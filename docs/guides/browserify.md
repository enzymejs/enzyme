# Using enzyme with Browserify

If you are using a test runner that runs code in a browser-based environment, you may be using
[browserify](https://browserify.org) in order to bundle your React code.

Prior to enzyme 3.0 there were some issues with conditional requires that were used
to maintain backwards compatibility with React versions. With enzyme 3.0+, this
should no longer be an issue. If it is, please file a GitHub issue or make a PR
to this documentation with instructions on how to set it up.
