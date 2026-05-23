import fs from "node:fs/promises";
import path from "node:path";

const wrapperRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(wrapperRoot, "..");
const frontendRoot = path.join(repoRoot, "fishing-ai-frontend");
const outRoot = path.join(wrapperRoot, "www");
const appRoot = path.join(outRoot, "app");
const apiUrl = process.env.OCEANCORE_API_URL || "https://fishing-ai-backend.onrender.com";

const files = [
  "index.html",
  "manifest.webmanifest",
  "offline.html",
  "sw.js"
];

async function copyFile(relativePath) {
  const source = path.join(frontendRoot, relativePath);
  const target = path.join(appRoot, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}

async function copyDir(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDir(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

function jsString(value) {
  return JSON.stringify(String(value || ""));
}

await fs.rm(outRoot, { recursive: true, force: true });
for (const file of files) {
  await copyFile(file);
}
await copyDir(path.join(frontendRoot, "assets"), path.join(appRoot, "assets"));
await fs.writeFile(
  path.join(appRoot, "assets", "native-config.js"),
  `window.OCEANCORE_API_URL = ${jsString(apiUrl)};\n`,
  "utf8"
);
await fs.writeFile(
  path.join(outRoot, "index.html"),
  '<!doctype html><meta http-equiv="refresh" content="0; url=./app/"><title>OceanCore AI</title><a href="./app/">Open OceanCore AI</a>\n',
  "utf8"
);

console.log(`Prepared Capacitor web assets in ${outRoot}`);
console.log(`Native API URL: ${apiUrl}`);
