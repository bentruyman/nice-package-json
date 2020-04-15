/**
 * An opinionated formatter for package.json files
 *
 * @param object - parsed package.json contents
 * @returns {string} A formatted package.json structure
 */
declare function nicePackageJson<T extends object>(object: T): T;

export = nicePackageJson;
