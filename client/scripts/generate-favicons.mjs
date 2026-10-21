import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
const publicDir = path.join(__dirname, '..', 'public');

const svg = fs.readFileSync(svgPath, 'utf8');

const sizes = [
  { size: 16, dest: path.join(publicDir, 'favicon-16x16.png') },
  { size: 32, dest: path.join(publicDir, 'favicon-32x32.png') },
  { size: 48, dest: path.join(publicDir, 'favicon-48x48.png') },
  { size: 180, dest: path.join(publicDir, 'apple-touch-icon.png') },
  { size: 192, dest: path.join(publicDir, 'android-chrome-192x192.png') },
  { size: 512, dest: path.join(publicDir, 'android-chrome-512x512.png') },
];

for (const { size, dest } of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: size,
    },
    shapeRendering: 2,
    textRendering: 1,
    imageRendering: 0,
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(dest, pngBuffer);
  console.log(`Generated ${dest} (${size}x${size}, ${pngBuffer.length} bytes)`);
}
