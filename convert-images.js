const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sourceDir = "C:\\Users\\User\\Desktop\\BSSE\\kepek";
const targetDir = "C:\\Users\\User\\Desktop\\BSSE\\webp";
const validExts = new Set([".jpg", ".jpeg", ".png"]);

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function processFile(filePath) {
  const relativePath = path.relative(sourceDir, filePath);
  const parsed = path.parse(relativePath);

  const smallOut = path.join(targetDir, "small", parsed.dir, `${parsed.name}.webp`);
  const largeOut = path.join(targetDir, "large", parsed.dir, `${parsed.name}.webp`);

  await ensureDir(path.dirname(smallOut));
  await ensureDir(path.dirname(largeOut));

  await sharp(filePath)
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(smallOut);

  await sharp(filePath)
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(largeOut);

  console.log("OK:", relativePath);
}

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (validExts.has(ext)) {
        await processFile(fullPath);
      }
    }
  }
}

walk(sourceDir)
  .then(() => console.log("Kész."))
  .catch((err) => {
    console.error("Hiba:", err);
    process.exit(1);
  });
