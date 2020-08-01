#!/usr/bin/env node
"use strict";

const { lstatSync, readFileSync, writeFileSync } = require("fs");
const { join, resolve } = require("path");

const c = require("ansi-colors");
const meow = require("meow");

const nicePackageJson = require("./");

const FLAGS = {
  write: { type: "boolean" },
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

  Object.keys(cli.flags).forEach((flag) => {
    if (KNOWN_FLAG_NAMES.includes(flag) === false) {
      err(`invalid argument "${flag}"`);
      process.exit(1);
    }
  });

  let inputs =
    cli.input.length === 0 // if no input is provided
      ? [resolveInput(join(process.cwd(), "package.json"))] // or assume a package.json in cwd
      : cli.input.map(resolveInput); // use it

  // dedupe if writing files
  if (cli.flags.write) {
    inputs = Array.from(new Set(inputs));
  }

  inputs.forEach((input) => {
    processPackage(input, cli.flags.write);
  });
}

function invalidInput(path) {
  err(`invalid input: ${path}`);
}

function processPackage(input, write = false) {
  try {
    const pkgData = readFileSync(input);
    const inputPkg = JSON.parse(pkgData);
    const formattedPkg = nicePackageJson(inputPkg);
    if (write === true) {
      if (pkgData.toString() !== formattedPkg) {
        writeFileSync(input, formattedPkg);
      }
    } else {
      process.stdout.write(formattedPkg);
    }
  } catch (e) {
    console.error("Unknown Error:", e);
    process.exit(1);
  }
}

function resolveInput(input) {
  let stat;

  input = resolve(process.cwd(), input);

  try {
    stat = lstatSync(input);
  } catch (e) {
    invalidInput(input);
  }

  if (stat.isDirectory()) {
    input = join(input, "package.json");

    try {
      lstatSync(input);
    } catch (e) {
      invalidInput(input);
    }
  }

  return input;
}

main();
