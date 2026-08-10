const sharp = require('sharp');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public');

const JOBS = [
  { input: path.join(__dirname, '..', 'src', 'assets', 'images', 'hero.png'), output: path.join(__dirname, '..', 'src', 'assets', 'images', 'hero.webp'), width: 1920, quality: 82 },
  { input: path.join(__dirname, '..', 'src', 'assets', 'images', 'hero.png'), output: path.join(__dirname, '..', 'src', 'assets', 'images', 'hero-mobile.webp'), width: 720, quality: 75 },
  { input: path.join(OUT_DIR, 'hero-2.png'), output: path.join(OUT_DIR, 'hero-2.webp'), width: 1920, quality: 80 },
  { input: path.join(OUT_DIR, 'hero-3.png'), output: path.join(OUT_DIR, 'hero-3.webp'), width: 1920, quality: 80 },
  { input: path.join(OUT_DIR, 'car engine.jpg'), output: path.join(OUT_DIR, 'car-engine.webp'), width: 1440, quality: 80 },
  { input: path.join(OUT_DIR, 'brake system.jpg'), output: path.join(OUT_DIR, 'brake-system.webp'), width: 1440, quality: 80 },
  { input: path.join(OUT_DIR, 'transmission.jpg'), output: path.join(OUT_DIR, 'transmission.webp'), width: 1440, quality: 80 },
  { input: path.join(OUT_DIR, 'supension.jpg'), output: path.join(OUT_DIR, 'suspension.webp'), width: 1440, quality: 80 },
  { input: path.join(OUT_DIR, 'Steering pumps.jpg'), output: path.join(OUT_DIR, 'steering-pumps.webp'), width: 1440, quality: 80 },
  { input: path.join(OUT_DIR, 'wesley-tingey-2fTXCO4Cz1A-unsplash.jpg'), output: path.join(OUT_DIR, 'wesley-tingey-2fTXCO4Cz1A-unsplash.webp'), width: 1440, quality: 80 },
];

(async () => {
  let totalBefore = 0;
  let totalAfter = 0;
  for (const job of JOBS) {
    if (!require('fs').existsSync(job.input)) {
      console.log(`SKIP (input gone): ${path.basename(job.input)}`);
      continue;
    }
    const before = require('fs').statSync(job.input).size;
    await sharp(job.input).resize({ width: job.width, withoutEnlargement: true }).webp({ quality: job.quality }).toFile(job.output);
    const after = require('fs').statSync(job.output).size;
    totalBefore += before;
    totalAfter += after;
    console.log(`${path.basename(job.input)} -> ${path.basename(job.output)}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
  }
  console.log(`TOTAL: ${(totalBefore / 1048576).toFixed(2)}MB -> ${(totalAfter / 1048576).toFixed(2)}MB (${(100 - (totalAfter / totalBefore) * 100).toFixed(1)}% saved)`);
})().catch((e) => { console.error('FAILED:', e); process.exit(1); });