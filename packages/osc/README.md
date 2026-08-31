# @strudel/osc

OSC output for strudel patterns! Currently only tested with super collider / super dirt.

## Usage

Assuming you have [node.js](https://nodejs.org/) installed, you can run the osc bridge server via:

```sh
npx @strudel/osc
```

You should see something like:

```log
osc client running on port 57120
osc server running on port 57121
websocket server running on port 8080
```

### --port

By default it will use port 57120 for the osc client, which is what [superdirt](https://github.com/musikinformatik/SuperDirt) uses. You can change it via the `--port` option:

```sh
npx @strudel/osc --port 7771 # classic dirt
```

### --debug

To log all incoming osc messages, add the `--debug` flag:

```sh
npx @strudel/osc --debug
```

## Usage in Strudel

To test it in strudel, you have can use `all(osc)` to send all events through osc:

```js
$: s("bd*4")

all(osc)
```

[open in repl](https://strudel.cc/#JDogcygiYmQqNCIpCgphbGwob3NjKQ%3D%3D)

You can read more about [how to use Superdirt with Strudel](https://strudel.cc/learn/input-output/#oscsuperdirtstrudeldirt) in  the tutorial.
