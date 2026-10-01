/**
 * The API in server/core is the certified FORGE CT API (../api), copied verbatim so this Nitro build
 * deploys on its own. Until cutover retires ../api, the two must not drift: any edit belongs in both.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const here = path.dirname(new URL(import.meta.url).pathname);
const core = path.join(here, "../server/core");
const certified = path.join(here, "../../api");

let certifiedFiles;
try {
  certifiedFiles = (await readdir(certified)).filter((f) => f.endsWith(".js")).sort();
} catch {
  console.log("api parity: ../api not present (post-cutover checkout); skipping.");
  process.exit(0);
}
const coreFiles = (await readdir(core)).filter((f) => f.endsWith(".js")).sort();
const failures = [];
if (certifiedFiles.join() !== coreFiles.join()) {
  failures.push(`file sets differ:\n  ../api: ${certifiedFiles.join(", ")}\n  server/core: ${coreFiles.join(", ")}`);
}
for (const file of certifiedFiles.filter((f) => coreFiles.includes(f))) {
  const [a, b] = await Promise.all([readFile(path.join(certified, file), "utf8"), readFile(path.join(core, file), "utf8")]);
  if (a !== b) failures.push(`${file} differs from ../api/${file}`);
}
if (failures.length) {
  console.error(`api parity failed:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`api parity: ${coreFiles.length} files identical to the certified ../api.`);
