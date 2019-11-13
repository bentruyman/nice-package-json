"use strict";

const { execFile } = require("child_process");
const { copyFileSync } = require("fs");
const { join } = require("path");

const tmp = require("tmp");

const ROOT = join(__dirname, "..");
const BIN = join(ROOT, "bin.js");
const FIXTURES = join(__dirname, "fixtures");

function exec(options = {}, args = []) {
  return new Promise(resolve => {
    execFile("node", [BIN, ...args], options, (err, stdout, stderr) => {
      resolve({ err, stdout, stderr });
    });
  });
}

describe("cli", () => {
  describe("when no path is specified", () => {
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

    it("shows an error when no package.json file is found", async () => {
      const dir = tmp.dirSync();

      const { err, stdout, stderr } = await exec({ cwd: __dirname });
      expect(err).not.toBeNull();
      expect(stdout).toBe("");
      expect(stderr).toMatchSnapshot();
    });
  });

  describe("when a path is specified", () => {
    describe("and is a directory", () => {
      it("prints a formatted package.json from the specified directory", async () => {
        const dir = tmp.dirSync();

        copyFileSync(
          join(FIXTURES, "input/full.json"),
          join(dir.name, "package.json")
        );
        const { err, stdout, stderr } = await exec({ cwd: __dirname }, [
          dir.name
        ]);
        expect(err).toBeNull();
        expect(stdout).toMatchSnapshot();
        expect(stderr).toBe("");
      });

      it("shows an error when no package.json file is found", () => {});
    });

    describe("and is a file", () => {
      it("prints a formatted package.json using the specified file", () => {});

      it("shows an error if the file is not valid JSON", () => {});
    });
  });
});
