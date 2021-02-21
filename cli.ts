import { join, resolve } from "https://deno.land/std@0.88.0/path/mod.ts";
import { cac } from "https://unpkg.com/cac/mod.ts";

import nicePackageJson from "./mod.ts";

const pkg = JSON.parse(Deno.readTextFileSync("./package.json"));

main();

function main() {
  const app = cac("nice-package-json");

  app
    .option("--write", "Overwrite input with formatted output")
    .usage("[options] [file]")
    .help()
    .version(pkg.version);

  const { args, options } = app.parse();
  if (options.help || options.version) Deno.exit(0);
  const shouldWrite = options.write === true;

  cli(args, shouldWrite);
}

function cli(args: readonly string[], shouldWrite = false) {
  let inputs = args.length === 0 // if no input is provided
    ? [resolveInput(join(Deno.cwd(), "package.json"))] // or assume a package.json in cwd
    : args.map(resolveInput); // use it

  // dedupe if writing files
  if (shouldWrite) {
    inputs = Array.from(new Set(inputs));
  }

  inputs.forEach((input) => {
    processPackage(input, shouldWrite);
  });
}

function err(message: string) {
  console.error(`Error: ${message}`);
  Deno.exit(1);
}

function invalidInput(path: string) {
  err(`invalid input: ${path}`);
}

function processPackage(input: string, write: boolean) {
  try {
    const pkgData = Deno.readTextFileSync(input);
    const inputPkg = JSON.parse(pkgData);
    const formattedPkg = nicePackageJson(inputPkg);
    if (write === true) {
      if (pkgData !== formattedPkg) {
        Deno.writeTextFileSync(input, formattedPkg);
      }
    } else {
      console.log(formattedPkg);
    }
  } catch (e) {
    console.error("Unknown Error:", e);
    Deno.exit(1);
  }
}

function resolveInput(input: string): string {
  input = resolve(Deno.cwd(), input);

  try {
    const stat = Deno.lstatSync(input);

    if (stat.isDirectory) {
      input = join(input, "package.json");
      Deno.lstatSync(input);
    }
  } catch (e) {
    invalidInput(input);
  }

  return input;
}
