#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const c = require("ansi-colors");
const meow = require("meow");

const nicePackageJson = require("./");

const writeFile = promisify(fs.writeFile);

const FLAGS = {
  write: {
    type: "boolean"
  }
};

const KNOWN_FLAG_NAMES = Object.keys(FLAGS);

const cli = meow(
  `
  Usage
    $ nice-package-json [options] [file]

  Formats package.json files consistently

  Options
    --diff print a diff of any changes to be made
    --write overwrite input with fixed output
`,
  { flags: FLAGS }
);

Object.keys(cli.flags).forEach(flag => {
  if (KNOWN_FLAG_NAMES.includes(flag) === false) {
    console.log(`${c.red("Error:")} invalid argument "${flag}"`);
    process.exit(1);
  }
});

const PKG_PATH = cli.input[0] // if a package.json path is specified
  ? path.resolve(process.cwd(), cli.input[0]) // use it
  : path.join(process.cwd(), "package.json"); // or assume a package.json in cwd

// TODO: handle filenames resolve a missing file or invalid json
const pkg = require(PKG_PATH);

const formatted = nicePackageJson(pkg);

async function main() {
  if (cli.flags.write === true) {
    return writeFile(pkgPath, formatted);
  } else {
    return process.stdout.write(formatted);
  }
}

main();
