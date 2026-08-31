# @strudel/sampler

This package allows you to serve your samples on disk to the strudel REPL. 

```sh
cd ~/your/samples/ 
npx @strudel/sampler
```

This will run a server on `http://localhost:5432`. 
You can now load the samples via:

```js
samples('http://localhost:5432')
```

## Options

```sh
LOG=1 npx @strudel/sampler # adds logging
PORT=5555 npx @strudel/sampler # changes port
```

## static json

when running with `--json`, you will simply get the json logged back:

```sh
npx --yes @strudel/sampler --json > strudel.json
```

this is useful if you want to create a sample pack from the current folder.