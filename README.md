# nice-package-json

[![Build status](https://github.com/bentruyman/nice-package-json/actions/workflows/build.yml/badge.svg)](https://github.com/bentruyman/nice-package-json/actions/workflows/build.yml)

> An opinionated formatter for `package.json` files

## Installation

```console
$ deno install --allow-{read,write} -n nice-package-json \
    https://deno.land/x/nice_package_json/cli.ts
```

## Usage

Print a formatted `package.json` file from the current working directory:

```console
$ nice-package-json
```

Format and overwrite the `package.json` in the current working directory:

```console
$ nice-package-json --write
```

Or format a file named something other than `package.json`:

```console
$ nice-package-json --write pkg.json
```

Compare with the current `package.json` file:

```console
$ nice-package-json | diff package.json -
```

Format each `package.json` in a Yarn-managed monorepo:

```console
$ yarn workspaces run nice-package-json --write
```

### Programmatically

```typescript
import nicePackageJson from "https://deno.land/x/nice_package_json/mod.ts";

const contents = Deno.readTextFileSync("./package.json");
const json = JSON.parse(contents);
Deno.writeTextFileSync("./package.json", nicePackageJson(json));
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
  - `type`
  - `browser`
  - `main`
  - `module`
  - `svelte`
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
  - `contributors` (by `name` or value)
  - `engines` (by key)
  - `files`
  - `keywords`
  - `publishConfig` (by key)
  - `repository` (by key)
  - `scripts` (by key)
