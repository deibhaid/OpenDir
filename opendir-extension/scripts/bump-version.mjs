#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { bumpVersion } from './version.mjs';
import { syncManifestVersion } from './sync-version.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extRoot = resolve(__dirname, '..');
const repoRoot = resolve(extRoot, '..');

function replaceVersionInFile(path, oldVersion, newVersion) {
  const replacements = [
    [`**Version:** ${oldVersion}`, `**Version:** ${newVersion}`],
    [`version: ${oldVersion}`, `version: ${newVersion}`],
    [`Current version: **${oldVersion}**`, `Current version: **${newVersion}**`],
    [`Stable releases are tagged \`v${oldVersion}\``, `Stable releases are tagged \`v${newVersion}\``],
    [`**Latest release:** [v${oldVersion}]`, `**Latest release:** [v${newVersion}]`],
    [`OpenDir ${oldVersion}`, `OpenDir ${newVersion}`],
    [`OpenDir-${oldVersion}.zip`, `OpenDir-${newVersion}.zip`],
    [`tag/v${oldVersion}`, `tag/v${newVersion}`],
  ];

  let content = readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    content = content.replaceAll(from, to);
  }
  writeFileSync(path, content);
}

function updatePackageLock(oldVersion, newVersion) {
  const path = resolve(extRoot, 'package-lock.json');
  let content = readFileSync(path, 'utf8');
  content = content.replace(
    `"version": "${oldVersion}",\n  "lockfileVersion"`,
    `"version": "${newVersion}",\n  "lockfileVersion"`,
  );
  content = content.replace(
    `"name": "opendir-extension",\n      "version": "${oldVersion}",`,
    `"name": "opendir-extension",\n      "version": "${newVersion}",`,
  );
  writeFileSync(path, content);
}

const pkg = JSON.parse(readFileSync(resolve(extRoot, 'package.json'), 'utf8'));
const oldVersion = pkg.version;
const newVersion = bumpVersion(oldVersion);

pkg.version = newVersion;
writeFileSync(resolve(extRoot, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
updatePackageLock(oldVersion, newVersion);
syncManifestVersion();

for (const file of [
  resolve(extRoot, 'SPEC.md'),
  resolve(extRoot, 'README.md'),
  resolve(extRoot, 'RELEASE.md'),
  resolve(repoRoot, 'README.md'),
]) {
  replaceVersionInFile(file, oldVersion, newVersion);
}

console.log(`Bumped OpenDir ${oldVersion} -> ${newVersion} (manifest synced)`);
