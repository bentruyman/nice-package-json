import { dirname, join } from "https://deno.land/std@0.88.0/path/mod.ts";
import {
  assert,
  assertEquals,
  assertMatch,
  assertNotEquals,
} from "https://deno.land/std@0.88.0/testing/asserts.ts";

const ROOT = dirname(import.meta.url);
const BIN = join(ROOT, "cli.ts");
const __dirname = dirname(new URL(import.meta.url).pathname);

interface ExecOptions {
  cwd?: string;
}

interface ExecResult {
  status: Deno.ProcessStatus;
  stderr: string;
  stdout: string;
}

async function exec(
  options: ExecOptions = {},
  args: string[] = [],
): Promise<ExecResult> {
  const cmd = ["deno", "run", "--allow-write", "--allow-read", BIN, ...args];
  const p = Deno.run({ cmd, stderr: "piped", stdout: "piped", ...options });
  const [status, stdout, stderr] = await Promise.all([
    p.status(),
    p.output(),
    p.stderrOutput(),
  ]);

  stdout.toString();

  p.close();

  return {
    status,
    stderr: new TextDecoder().decode(stderr),
    stdout: new TextDecoder().decode(stdout),
  };
}

Deno.test("$ nice-package-json | prints a formatted package.json from the current directory", async () => {
  const dir = Deno.makeTempDirSync();

  Deno.copyFileSync(
    "./fixtures/input/full.json",
    join(dir, "package.json"),
  );

  const { status, stdout, stderr } = await exec({ cwd: dir });

  assert(status.success);
  // TODO: assert on output
});

Deno.test("$ nice-package-json --write | overwrites an existing package.json if changes are made", async () => {
  const dir = Deno.makeTempDirSync();
  const inputFile = "./fixtures/input/full.json";
  const expectedFile = "./fixtures/expected/full.json";
  const targetPkg = join(dir, "package.json");

  Deno.copyFileSync(inputFile, targetPkg);

  assertNotEquals(
    JSON.parse(Deno.readTextFileSync(targetPkg)),
    JSON.parse(Deno.readTextFileSync(expectedFile)),
  );
  await exec({ cwd: dir }, ["--write"]);
  assertEquals(
    JSON.parse(Deno.readTextFileSync(targetPkg)),
    JSON.parse(Deno.readTextFileSync(expectedFile)),
  );
});

Deno.test("$ nice-package-json --write | doesn't touch an existing package.json if no changes are made", async () => {
  const dir = Deno.makeTempDirSync();
  const inputFile = "./fixtures/expected/full.json";
  const targetPkg = join(dir, "package.json");

  Deno.copyFileSync(inputFile, targetPkg);

  const beforeModifiedTime = Deno.statSync(targetPkg).mtime;
  await exec({ cwd: dir }, ["--write"]);
  const afterModifiedTime = Deno.statSync(targetPkg).mtime;

  assertEquals(beforeModifiedTime, afterModifiedTime);
});

Deno.test("$ nice-package-json /path/to/dir | prints a formatted package.json from the specified directory", async () => {
  const dir = Deno.makeTempDirSync();
  const inputFile = "./fixtures/expected/full.json";
  const targetPkg = join(dir, "package.json");

  Deno.copyFileSync(inputFile, targetPkg);

  const { status, stdout, stderr } = await exec({ cwd: __dirname }, [dir]);
  assert(status.success);
  // TODO: assert on output
});

Deno.test("$ nice-package-json /path/to/dir | shows an error when no package.json file is found", async () => {
  const { status, stdout, stderr } = await exec({ cwd: __dirname }, [
    "/missing/dir",
  ]);

  assert(!status.success);
  assertEquals(stdout, "");
  assertMatch(stderr, /invalid input: \/missing\/dir/);
});

Deno.test("$ nice-package-json /path/to/package.json | prints a formatted package.json using the specified file", async () => {
  const dir = Deno.makeTempDirSync();

  Deno.copyFileSync(
    "./fixtures/input/full.json",
    join(dir, "package.json"),
  );
  const { status, stdout, stderr } = await exec({ cwd: dir }, [
    "./package.json",
  ]);

  assert(status.success);
  // assertEquals(stdout, ""); // TODO: implement
  // assertEquals(stderr, "");
});

Deno.test("$ nice-package-json /path/to/package.json | shows an error if the file is not valid JSON", async () => {
  const { status, stdout, stderr } = await exec({ cwd: __dirname }, [
    "/missing/dir/package.json",
  ]);

  assert(!status.success);
  assertEquals(stdout, "");
  assertMatch(stderr, /invalid input: \/missing\/dir\/package.json/);
});

Deno.test("$ nice-package-json {foo,bar}/package.json | prints formatted package.json files using the specified file", async () => {
  const dirA = Deno.makeTempDirSync();
  const dirB = Deno.makeTempDirSync();

  Deno.copyFileSync(
    "./fixtures/input/full.json",
    join(dirA, "package.json"),
  );
  Deno.copyFileSync(
    "./fixtures/input/full.json",
    join(dirB, "package.json"),
  );
  const { status, stdout, stderr } = await exec({ cwd: __dirname }, [
    join(dirA, "package.json"),
    join(dirB, "package.json"),
  ]);

  assert(status.success);
  // assertEquals(stdout, ""); // TODO: implement
  // assertEquals(stderr, "");
});

Deno.test("$ nice-package-json --write | overwrites existing package.json files if changes are made", async () => {
  const dirA = Deno.makeTempDirSync();
  const dirB = Deno.makeTempDirSync();

  const inputFullFile = "./fixtures/input/full.json";
  const inputPartialFile = "./fixtures/input/partial.json";

  const expectedFullFile = "./fixtures/expected/full.json";
  const expectedPartialFile = "./fixtures/expected/partial.json";

  const targetPkgA = join(dirA, "package.json");
  const targetPkgB = join(dirB, "package.json");

  Deno.copyFileSync(inputFullFile, targetPkgA);
  Deno.copyFileSync(inputPartialFile, targetPkgB);

  assertEquals(
    Deno.readTextFileSync(targetPkgA),
    Deno.readTextFileSync(inputFullFile).toString(),
  );
  assertEquals(
    Deno.readTextFileSync(targetPkgB),
    Deno.readTextFileSync(inputPartialFile).toString(),
  );

  await exec({ cwd: __dirname }, ["--write", dirA, dirB]);

  assertEquals(
    Deno.readTextFileSync(targetPkgA),
    Deno.readTextFileSync(expectedFullFile).toString(),
  );
  assertEquals(
    Deno.readTextFileSync(targetPkgB),
    Deno.readTextFileSync(expectedPartialFile).toString(),
  );
});
