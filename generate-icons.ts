import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');

async function generateIcons() {
  // Create icon-192.png from SVG
  const svg192 = fs.readFileSync(path.join(publicDir, 'icon-192.svg'));
  await sharp(svg192)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // Create icon-512.png from SVG
  const svg512 = fs.readFileSync(path.join(publicDir, 'icon-512.svg'));
  await sharp(svg512)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // Also create apple-touch-icon
  await sharp(svg192)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Create favicon
  await sharp(svg192)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32.png'));
  console.log('Generated favicon-32.png');

  await sharp(svg192)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16.png'));
  console.log('Generated favicon-16.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
