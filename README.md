# nice-package-json

[![Build Status](https://travis-ci.org/bentruyman/nice-package-json.svg?branch=develop)](https://travis-ci.org/bentruyman/nice-package-json)

> An opinionated formatter for `package.json` files

## Usage

Print a formatted `package.json` file from the current working directory:

```console
$ npx nice-package-json
```

Format and overwrite the `package.json` in the current working directory:

```console
$ npx nice-package-json --write
```

Or format a file named something other than `package.json`:

```console
$ npx nice-package-json --write pkg.json
```

### Programmatically

```javascript
const nicePkg = require("nice-package-json");
const pkg = require("./package.json");
await fs.writeFile("package.json", nicePackageJson(pkg));
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
