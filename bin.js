#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { promisify } = require('util');


const meow = require("meow");

const nicePackageJson = require("./");

const writeFile = promisify(fs.writeFile);

const cli = meow(
  `
  Usage
    $ nice-package-json [options] [file]

  Formats package.json files consistently

  Options
    --write overwrite input with fixed output
`,
  {
    flags: {
      write: {
        type: "boolean"
      }
    }
  }
);

let pkgPath = path.join(process.cwd(), "package.json");

if (cli.input[0]) {
  pkgPath = path.resolve(process.cwd(), cli.input[0]);
}

const pkg = require(pkgPath);

const formatted = nicePackageJson(pkg);

async function main() {
  if (cli.flags.write === false) {
    return process.stdout.write(formatted);
  } else {
    return writeFile(pkgPath, formatted);
  }
}

main();
