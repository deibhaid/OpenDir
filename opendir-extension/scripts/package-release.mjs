#!/usr/bin/env node
/**
 * Package OpenDir dist/ for GitHub release upload.
 * Run from repo root after `npm run build` in opendir-extension/.
 */

import { readFileSync, mkdirSync, cpSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extRoot = resolve(__dirname, '..');
const repoRoot = resolve(extRoot, '..');
const version = JSON.parse(readFileSync(resolve(extRoot, 'package.json'), 'utf8')).version;
const packageDir = resolve(repoRoot, 'release', `opendir-extension-v${version}`);
const zipPath = resolve(repoRoot, 'release', `OpenDir-${version}.zip`);

rmSync(packageDir, { recursive: true, force: true });
mkdirSync(packageDir, { recursive: true });
cpSync(resolve(extRoot, 'dist'), resolve(packageDir, 'dist'), { recursive: true });
for (const doc of ['CHANGELOG.md', 'NOTICE.md', 'RELEASE.md']) {
  cpSync(resolve(extRoot, doc), resolve(packageDir, doc));
}

rmSync(zipPath, { force: true });
execSync(`zip -r "${zipPath}" "opendir-extension-v${version}"`, {
  cwd: resolve(repoRoot, 'release'),
  stdio: 'inherit',
});

console.log(`Created ${zipPath}`);
