# my-patterns

This directory can be used to save your own patterns, which then get
made into a pattern swatch.

Example: <https://felixroos.github.io/strudel/swatch/>

Please note: These instructions have not been fully tested/adapted since strudel moved to codeberg from github. PRs welcome!

## deploy

### 1. fork the [strudel repo on codeberg](https://codeberg.org/uzu/strudel.git)

### 2. clone your fork to your machine `git clone https://codeberg.org/<your-username>/strudel.git strudel && cd strudel`

### 3. create a separate branch like `git branch patternuary && git checkout patternuary`

### 4. save one or more .txt files in the my-patterns folder

### 5. edit `website/public/CNAME` to contain `<your-username>.codeberg.page/strudel`

### 6. edit `website/astro.config.mjs` to use site: `https://<your-username>.codeberg.page` and base `/strudel`, like this

```js
const site = 'https://<your-username>.codeberg.page';
const base = '/strudel';
```

### 7. commit & push the changes

```sh
git add . && git commit -m "site config" && git push --set-upstream origin
```

### 8. deploy to codeberg pages

### 9. view your patterns at `<your-username>.codeberg.page/strudel/swatch/`

### 10. optional: automatic deployment

If you want to automatically deploy your site on push, go to `deploy.yml` and change `workflow_dispatch` to `push`.

## running locally

- install dependencies with `npm run setup`
- run dev server with `npm run repl` and open `http://localhost:4321/strudel/swatch/`

## tests fail?

Your tests might fail if the code does not follow prettiers format.
In that case, run `npm run codeformat`. To disable that, remove `npm run format-check` from `test.yml`

## updating your fork

To update your fork, you can pull the main branch and merge it into your `patternuary` branch.
