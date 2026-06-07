import { mkdirSync, writeFileSync, cpSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicIcons = resolve(root, 'public/icons');
const distIcons = resolve(root, 'dist/icons');

mkdirSync(publicIcons, { recursive: true });

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="#2563eb"/>
  <path d="M28 44h34l10 12h38v44a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8V52a8 8 0 0 1 8-8z" fill="#dbeafe"/>
  <path d="M28 44h34l10 12h38v8H28z" fill="#93c5fd"/>
</svg>
`;

for (const size of [16, 32, 48, 128]) {
  const output = resolve(publicIcons, `icon${size}.png`);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(output);
}

if (existsSync(resolve(root, 'dist'))) {
  mkdirSync(distIcons, { recursive: true });
  cpSync(publicIcons, distIcons, { recursive: true });
}

writeFileSync(resolve(publicIcons, 'README.txt'), 'Placeholder icons for OpenDir. Replace before public release.\n');

console.log('Generated placeholder icons in public/icons');
