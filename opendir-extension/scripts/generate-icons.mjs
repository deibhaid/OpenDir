import { mkdirSync, writeFileSync, cpSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicIcons = resolve(root, 'public/icons');
const distIcons = resolve(root, 'dist/icons');

mkdirSync(publicIcons, { recursive: true });

// Unique OpenDir icon: open folder with directory listing lines on a teal-indigo gradient.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="od-bg" x1="16" y1="12" x2="112" y2="116" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#14b8a6"/>
      <stop offset="55%" stop-color="#0891b2"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="od-tab" x1="34" y1="38" x2="78" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#99f6e4"/>
      <stop offset="100%" stop-color="#67e8f9"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#od-bg)"/>
  <path d="M28 46c0-4.4 3.6-8 8-8h24.8l8.8 8.8H92c4.4 0 8 3.6 8 8v34c0 4.4-3.6 8-8 8H36c-4.4 0-8-3.6-8-8V46Z" fill="#ecfeff" fill-opacity="0.96"/>
  <path d="M28 46c0-4.4 3.6-8 8-8h24.8l8.8 8.8H92c4.4 0 8 3.6 8 8v6H28v-14Z" fill="url(#od-tab)"/>
  <rect x="42" y="66" width="44" height="5" rx="2.5" fill="#0f766e" fill-opacity="0.85"/>
  <rect x="42" y="76" width="36" height="5" rx="2.5" fill="#155e75" fill-opacity="0.72"/>
  <rect x="42" y="86" width="40" height="5" rx="2.5" fill="#3730a3" fill-opacity="0.72"/>
  <path d="M78 58h10l8 8H78v-8Z" fill="#cffafe"/>
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

writeFileSync(
  resolve(publicIcons, 'README.txt'),
  'Original OpenDir placeholder icons (teal folder + listing motif). Replace before public release.\n',
);

console.log('Generated unique OpenDir icons in public/icons');
