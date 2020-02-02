"use strict";

const KEY_ORDER = [
  "name",
  "private",
  "version",
  "description",
  "keywords",
  "engines",
  "main",
  "type",
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
  "workspaces"
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
  "optionalDependencies"
];

module.exports = function nicePackageJson(originalPackage) {
  const pkg = { ...originalPackage };
  const formatted = {};

  for (const key of KEY_ORDER) {
    if (pkg.hasOwnProperty(key)) {
      if (SORTABLE_STR_KEY.includes(key)) {
        formatted[key] = pkg[key].sort();
      } else if (SORTABLE_OBJ_KEY.includes(key)) {
        const originalObj = pkg[key];
        const sortedObj = {};

        if (typeof originalObj === "string") {
          formatted[key] = originalObj;
          continue;
        }

        Object.keys(originalObj)
          .sort()
          .forEach(k => {
            sortedObj[k] = originalObj[k];
          });

        formatted[key] = sortedObj;
      } else if (key === "contributors") {
        formatted[key] = pkg[key].sort((a, b) => {
          // TODO: handle contributors with no 'name'
          return a.name > b.name ? 1 : -1;
        });
      } else {
        formatted[key] = pkg[key];
      }
    }

    delete pkg[key];
  }

  Object.keys(pkg)
    .sort()
    .forEach(k => {
      formatted[k] = pkg[k];
    });

  const json = JSON.stringify(formatted, null, "  ");

  return `${json}\n`;
};
