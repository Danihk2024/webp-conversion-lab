import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ALLOWED = ['jpeg', 'png', 'webp', 'gif', 'tiff'];
const files = await readdir('input');

console.log(`Found ${files.length} file(s) in input/`);

for (const file of files) {
  const inPath = path.join('input', file);
  const outPath = path.join('output', path.parse(file).name + '.webp');
  const start = performance.now();

  try {
    const img = sharp(inPath, { limitInputPixels: 50_000_000, failOn: 'error' });
    const meta = await img.metadata(); // real format from file contents, not the extension

    if (!ALLOWED.includes(meta.format)) {
      console.log(`REJECTED ${file}: format "${meta.format}" not allowed`);
      continue;
    }

    await img.rotate().webp({ quality: 80 }).toFile(outPath);

    const before = (await stat(inPath)).size;
    const after = (await stat(outPath)).size;
    const outMeta = await sharp(outPath).metadata();

    console.log(
      `OK ${file}: ${meta.format} ${meta.width}x${meta.height} | ` +
      `${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB | ` +
      `${Math.round(performance.now() - start)}ms | exif kept: ${!!outMeta.exif}`
    );
  } catch (err) {
    console.log(`FAILED ${file}: ${err.message}`);
  }
}