import { assertEquals } from "https://deno.land/std@0.88.0/testing/asserts.ts";

import nicePackageJson from "./mod.ts";

Deno.test("full.json", async () => {
  const input = await Deno.readTextFile("./fixtures/input/full.json");
  const expected = await Deno.readTextFile("./fixtures/expected/full.json");
  const output = nicePackageJson(JSON.parse(input));

  assertEquals(output, expected);
});

Deno.test("repeat runs generate the same output", async () => {
  const input = await Deno.readTextFile("./fixtures/input/full.json");
  const expected = await Deno.readTextFile("./fixtures/expected/full.json");
  const output = nicePackageJson(JSON.parse(input));

  assertEquals(output, expected);
  assertEquals(nicePackageJson(JSON.parse(output)), expected);
});
