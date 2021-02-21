const KEY_ORDER = [
  "name",
  "private",
  "version",
  "description",
  "keywords",
  "engines",
  "type",
  "browser",
  "main",
  "module",
  "svelte",
  "types",
  "bin",
  "files",
  "homepage",
  "bugs",
  "repository",
  "author",
  "contributors",
  "license",
  "scripts",
  "dependencies",
  "devDependencies",
  "bundledDependencies",
  "optionalDependencies",
  "peerDependencies",
  "publishConfig",
  "config",
  "workspaces",
];

const SORTABLE_STR_KEY = ["files", "keywords"];

const SORTABLE_OBJ_KEY = [
  "engines",
  "publishConfig",
  "repository",
  "scripts",
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "bundledDependencies",
  "optionalDependencies",
];

type ObjectValue = {
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
};

export default function nicePackageJson(originalPackage: ObjectValue) {
  const pkg = { ...originalPackage };
  const formatted: ObjectValue = {};

  for (const key of KEY_ORDER) {
    const pkgValue = pkg[key];

    if (pkgValue === undefined) continue;
    delete pkg[key];

    if (SORTABLE_STR_KEY.includes(key) && Array.isArray(pkgValue)) {
      formatted[key] = pkgValue.sort();
    } else if (SORTABLE_OBJ_KEY.includes(key)) {
      if (typeof pkgValue === "string") {
        formatted[key] = pkgValue;
        continue;
      } else if (isObject(pkgValue)) {
        const sortedObj: ObjectValue = {};

        assignAlphabetically(pkgValue, sortedObj);

        formatted[key] = sortedObj;
      }
    } else if (key === "contributors" && Array.isArray(pkgValue)) {
      formatted[key] = pkgValue.sort(byContributorName);
    } else {
      formatted[key] = pkgValue;
    }
  }

  assignAlphabetically(pkg, formatted);

  return createJsonString(formatted);
}

function assignAlphabetically(source: ObjectValue, target: ObjectValue): void {
  Object.keys(source)
    .sort()
    .forEach((k) => {
      target[k] = source[k];
    });
}

// deno-lint-ignore no-explicit-any
function byContributorName(a: any, b: any): number {
  const valueA = isObject(a) ? a.name : a;
  const valueB = isObject(b) ? b.name : b;

  return valueA > valueB ? 1 : -1;
}

function createJsonString(obj: ObjectValue): string {
  return `${JSON.stringify(obj, null, "  ")}\n`;
}

function isObject(val: unknown): val is ObjectValue {
  return Object.prototype.toString.call(val) === "[object Object]";
}
