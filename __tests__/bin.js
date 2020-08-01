"use strict";

const { execFile } = require("child_process");
const { copyFileSync, readFileSync, statSync } = require("fs");
const { join } = require("path");

const tmp = require("tmp");

const ROOT = join(__dirname, "..");
const BIN = join(ROOT, "bin.js");
const FIXTURES = join(__dirname, "fixtures");

function exec(options = {}, args = []) {
  return new Promise((resolve) => {
    execFile("node", [BIN, ...args], options, (err, stdout, stderr) => {
      resolve({ err, stdout, stderr });
    });
  });
}

describe("$ nice-package-json", () => {
  it("prints a formatted package.json from the current directory", async () => {
    const dir = tmp.dirSync();

    copyFileSync(
      join(FIXTURES, "input/full.json"),
      join(dir.name, "package.json")
    );

    const { err, stdout, stderr } = await exec({ cwd: dir.name });
    expect(err).toBeNull();
    expect(stdout).toMatchSnapshot();
    expect(stderr).toBe("");
  });

  describe(" --write", () => {
    it("overwrites an existing package.json if changes are made", async () => {
      const dir = tmp.dirSync();
      const inputFile = join(FIXTURES, "input/full.json");
      const expectedFile = join(FIXTURES, "expected/full.json");
      const targetPkg = join(dir.name, "package.json");

      copyFileSync(inputFile, targetPkg);

      expect(readFileSync(targetPkg).toString()).toEqual(
        readFileSync(inputFile).toString()
      );
      await exec({ cwd: dir.name }, ["--write"]);
      expect(readFileSync(targetPkg).toString()).toEqual(
        readFileSync(expectedFile).toString()
      );
    });

    it("doesn't touch an existing package.json if no changes are made", async () => {
      const dir = tmp.dirSync();
      const inputFile = join(FIXTURES, "expected/full.json");
      const targetPkg = join(dir.name, "package.json");

      copyFileSync(inputFile, targetPkg);

      const beforeModifiedTime = statSync(targetPkg).mtimeMs;
      await exec({ cwd: dir.name }, ["--write"]);
      const afterModifiedTime = statSync(targetPkg).mtimeMs;

      expect(beforeModifiedTime).toBe(afterModifiedTime);
    });
  });
});

describe("$ nice-package-json /path/to/dir", () => {
  it("prints a formatted package.json from the specified directory", async () => {
    const dir = tmp.dirSync();

    copyFileSync(
      join(FIXTURES, "input/full.json"),
      join(dir.name, "package.json")
    );
    const { err, stdout, stderr } = await exec({ cwd: __dirname }, [dir.name]);
    expect(err).toBeNull();
    expect(stdout).toMatchSnapshot();
    expect(stderr).toBe("");
  });

  it("shows an error when no package.json file is found", async () => {
    const { err, stdout, stderr } = await exec({ cwd: __dirname }, [
      "/missing/dir",
    ]);
    expect(err.message).toMatch("invalid input: /missing/dir");
    expect(stdout).toMatchSnapshot();
    expect(stderr).toMatch("invalid input: /missing/dir");
  });
});

describe("$ nice-package-json /path/to/package.json", () => {
  it("prints a formatted package.json using the specified file", async () => {
    const dir = tmp.dirSync();

    copyFileSync(
      join(FIXTURES, "input/full.json"),
      join(dir.name, "package.json")
    );
    const { err, stdout, stderr } = await exec({ cwd: dir.name }, [
      "./package.json",
    ]);
    expect(err).toBeNull();
    expect(stdout).toMatchSnapshot();
    expect(stderr).toBe("");
  });

  it("shows an error if the file is not valid JSON", async () => {
    const { err, stdout, stderr } = await exec({ cwd: __dirname }, [
      "/missing/dir/package.json",
    ]);
    expect(err.message).toMatch("invalid input: /missing/dir/package.json");
    expect(stdout).toMatchSnapshot();
    expect(stderr).toMatch("invalid input: /missing/dir/package.json");
  });
});

describe("$ nice-package-json {foo,bar}/package.json", () => {
  it("prints formatted package.json files using the specified file", async () => {
    const dirA = tmp.dirSync();
    const dirB = tmp.dirSync();

    copyFileSync(
      join(FIXTURES, "input/full.json"),
      join(dirA.name, "package.json")
    );
    copyFileSync(
      join(FIXTURES, "input/full.json"),
      join(dirB.name, "package.json")
    );
    const { err, stdout, stderr } = await exec({ cwd: __dirname }, [
      join(dirA.name, "package.json"),
      join(dirB.name, "package.json"),
    ]);
    expect(err).toBeNull();
    expect(stdout).toMatchSnapshot();
    expect(stderr).toBe("");
  });

  describe(" --write", () => {
    it("overwrites existing package.json files if changes are made", async () => {
      const dirA = tmp.dirSync();
      const dirB = tmp.dirSync();

      const inputFullFile = join(FIXTURES, "input/full.json");
      const inputPartialFile = join(FIXTURES, "input/partial.json");

      const expectedFullFile = join(FIXTURES, "expected/full.json");
      const expectedPartialFile = join(FIXTURES, "expected/partial.json");

      const targetPkgA = join(dirA.name, "package.json");
      const targetPkgB = join(dirB.name, "package.json");

      copyFileSync(inputFullFile, targetPkgA);
      copyFileSync(inputPartialFile, targetPkgB);

      expect(readFileSync(targetPkgA).toString()).toEqual(
        readFileSync(inputFullFile).toString()
      );
      expect(readFileSync(targetPkgB).toString()).toEqual(
        readFileSync(inputPartialFile).toString()
      );

      await exec({ cwd: __dirname }, ["--write", dirA.name, dirB.name]);

      expect(readFileSync(targetPkgA).toString()).toEqual(
        readFileSync(expectedFullFile).toString()
      );
      expect(readFileSync(targetPkgB).toString()).toEqual(
        readFileSync(expectedPartialFile).toString()
      );
    });
  });
});
