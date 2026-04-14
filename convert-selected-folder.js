const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const rootSourceDir = "C:\\Users\\User\\Desktop\\BSSE\\kepek";
const selectedFolder = "C:\\Users\\User\\Desktop\\BSSE\\kepek\\2024 augusztus";
const targetRootDir = "C:\\Users\\User\\Desktop\\BSSE\\webp";

const validExts = new Set([".jpg", ".jpeg", ".png"]);

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function removeDirIfExists(dir) {
  if (fs.existsSync(dir)) {
    await fs.promises.rm(dir, { recursive: true, force: true });
    console.log("Törölve:", dir);
  }
}

async function processFile(filePath) {
  const relativeToRoot = path.relative(rootSourceDir, filePath);
  const parsed = path.parse(relativeToRoot);

  const smallOut = path.join(targetRootDir, "small", parsed.dir, `${parsed.name}.webp`);
  const largeOut = path.join(targetRootDir, "large", parsed.dir, `${parsed.name}.webp`);

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

  console.log("OK:", relativeToRoot);
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

async function main() {
  const selectedRelative = path.relative(rootSourceDir, selectedFolder);

  const smallSelectedDir = path.join(targetRootDir, "small", selectedRelative);
  const largeSelectedDir = path.join(targetRootDir, "large", selectedRelative);

  await removeDirIfExists(smallSelectedDir);
  await removeDirIfExists(largeSelectedDir);

  await walk(selectedFolder);

  console.log("Kész.");
}

main().catch((err) => {
  console.error("Hiba:", err);
  process.exit(1);
});
