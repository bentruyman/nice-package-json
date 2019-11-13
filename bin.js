#!/usr/bin/env node
"use strict";

const fs = require("fs");
const { join, resolve } = require("path");
const { promisify } = require("util");

const c = require("ansi-colors");
const meow = require("meow");

const nicePackageJson = require("./");

const writeFile = promisify(fs.writeFile);

const FLAGS = {
  write: { type: "boolean" }
};

const KNOWN_FLAG_NAMES = Object.keys(FLAGS);

function err(message) {
  process.stderr.write(`${c.red("Error:")} ${message}\n`);
  process.exit(1);
}

function main() {
  const cli = meow(
    `
  Usage
    $ nice-package-json [options] [file]

  Formats package.json files consistently

  Options
    --write overwrite input with fixed output
`,
    { flags: FLAGS }
  );

  Object.keys(cli.flags).forEach(flag => {
    if (KNOWN_FLAG_NAMES.includes(flag) === false) {
      err(`invalid argument "${flag}"`);
      process.exit(1);
    }
  });

  let pkgPath = cli.input[0] // if a package.json path is specified
    ? resolve(process.cwd(), cli.input[0]) // use it
    : join(process.cwd(), "package.json"); // or assume a package.json in cwd

  let stat;

  try {
    stat = fs.lstatSync(pkgPath);
  } catch (e) {
    err("no package.json file found");
  }

  if (stat.isDirectory()) {
    pkgPath = join(pkgPath, "package.json");
  }

  try {
    const pkgData = fs.readFileSync(pkgPath);
    const pkg = JSON.parse(pkgData);
    const formatted = nicePackageJson(pkg);
    if (cli.flags.write === true) {
      return writeFile(pkgPath, formatted);
    } else {
      return process.stdout.write(formatted);
    }
  } catch (e) {
    console.error("unknown error", e);
  }
}

main();
