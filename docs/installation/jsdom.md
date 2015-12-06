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
