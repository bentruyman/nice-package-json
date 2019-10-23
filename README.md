# pretty-package

> An opinionated formatter for `package.json` files

## Usage

Format the `package.json` in the current working directory:

```console
$ npx pretty-package --write
```

Or just lint it:

```console
$ npx pretty-package --check
```

Or format a file named something other than `package.json`:

```console
$ npx pretty-package --write pkg.json
```

### Programmatically

```javascript
const prettyPkg = require("pretty-pkg");
const pkg = require("./package.json");
await fs.writeFile("package.json", prettyPkg(pkg));
```

## Formatting

- 2-space indent
- Dependencies are always alphabetized
- Keys will be sorted into the following order:
  - `name`
  - `private`
  - `version`
  - `description`
  - `keywords`
  - `engines`
  - `main`
  - `bin`
  - `files`
  - `homepage`
  - `bugs`
  - `repository`
  - `author`
  - `contributors`
  - `license`
  - `scripts`
  - `dependencies`
  - `devDependencies`
  - `bundledDependencies`
  - `optionalDependencies`
  - `peerDependencies`
  - `publishConfig`
  - `config`
  - `workspaces`
  - Everything else, sorted alphabetically (e.g. `eslintConfig`, `jest`, etc.)
- Values of the following keys will be sorted alphabetically:
  - `contributors` (by `name`)
  - `engines` (by key)
  - `files`
  - `keywords`
  - `publishConfig` (by key)
  - `repository` (by key)
  - `scripts` (by key)
