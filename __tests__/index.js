"use strict";

const { readFile } = require("fs").promises;
const { join } = require("path");

const prettyPackage = require("../");

async function readJson(filename) {
  return JSON.parse(await readFile(filename), "utf8");
}

function fixture(filename) {
  return join(__dirname, "fixtures", filename);
}

test("full.json", async () => {
  const input = await readJson(fixture("input/full.json"));
  const expected = await readFile(fixture("expected/full.json"), "utf8");
  const output = prettyPackage(input);

  expect(output).toEqual(expected);
});
