# Using Enzyme with SystemJS

If you are using a test runner that runs code in a browser-based environment,
you may be using [SystemJS]() in order to bundle your React code.

SystemJS uses static analysis to create a dependency graph at build-time of
your source code to build a bundle. Enzyme has a hand full of conditional
`require()` calls in it in order to remain compatible with React 0.13 and
React 0.14.

Unfortunately, these conditional requires mean there is a bit of extra setup
with bundlers like SystemJS.

In your SystemJS configuration, you simply need to make sure that the
following files are labeled as "external", which means they will be ignored:

```
react/addons
react/lib/ReactContext
react/lib/ExecutionEnvironment
```

Here is an example piece of configuration code marking these as external:

```json
/* package.json */
{
  "jspm": {
    "overrides": {
      "npm:enzyme@2.3.0": {
        "map": {
          "react/addons": "@empty",
          "react/lib/ExecutionEnvironment": "@empty",
          "react/lib/ReactContext": "@empty"
        }
      }
    }
  }
}
```


## React 0.14 Compatibility

If you are using React 0.14, the instructions above will be the same but with a different list of
externals:

```
react-dom
react-dom/server
react-addons-test-utils
```

## React 15 Compatability

If you are using React 15, your config should include these externals:

```json
/* package.json */
{
  "jspm": {
    "overrides": {
      "npm:enzyme@2.3.0": {
        "map": {
          "react/addons": "@empty",
          "react/lib/ExecutionEnvironment": "@empty",
          "react/lib/ReactContext": "@empty"
        }
      }
    }
  }
}
```
