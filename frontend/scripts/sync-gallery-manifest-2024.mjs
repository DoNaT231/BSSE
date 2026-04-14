/**
 * Szinkronizálja a public/webp/large/2024 augusztus mappa tartalmát a gallery-manifest.json-ba.
 * Új Vasárnap-képeket explicit 2024/08-augusztus/... útvonalon adja hozzá (nem a régi Meccsek_* küszöbbel).
 * Futtatás: a frontend mappából: node scripts/sync-gallery-manifest-2024.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const WEBP_BASE = path.join(FRONTEND_ROOT, "public", "webp", "large", "2024 augusztus");
const MANIFEST = path.join(FRONTEND_ROOT, "public", "gallery-manifest.json");

function walkWebp(dir, acc, prefix = "") {
  const full = path.join(dir, prefix);
  for (const ent of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
    if (ent.isDirectory()) walkWebp(dir, acc, rel);
    else if (ent.name.endsWith(".webp")) acc.push(rel.replace(/\\/g, "/"));
  }
}

function vasarnapDiskToExplicitManifest(rel) {
  const file = path.basename(rel);
  const m = file.match(/^Vasárnap_Meccsek-(\d+)\.webp$/i);
  if (!m) return null;
  return `2024/08-augusztus/Vasárnap/Meccsek/Meccsek_Vasárnap_Meccsek-${m[1]}.webp`;
}

function main() {
  if (!fs.existsSync(WEBP_BASE)) {
    console.error("Hiányzik:", WEBP_BASE);
    process.exit(1);
  }

  const diskFiles = [];
  walkWebp(WEBP_BASE, diskFiles, "");

  const fromDiskExplicit = new Set();
  for (const rel of diskFiles) {
    if (!/\/Meccsek\//.test(`/${rel}`)) continue;
    const base = path.basename(rel);
    if (/^Vasárnap_Meccsek-\d+\.webp$/i.test(base)) {
      const m = vasarnapDiskToExplicitManifest(rel);
      if (m) fromDiskExplicit.add(m);
    }
  }

  const szombatMeccsek = diskFiles
    .filter((r) => r.startsWith("Szombat/Meccsek/"))
    .map((r) => `2024/08-augusztus/${r}`);
  const szombatCsoport = diskFiles
    .filter((r) => r.startsWith("Szombat/Csoportképek/"))
    .map((r) => `2024/08-augusztus/${r}`);

  const raw = fs.readFileSync(MANIFEST, "utf8");
  const manifest = JSON.parse(raw.replace(/^\uFEFF/, ""));

  const toAdd = [...fromDiskExplicit, ...szombatMeccsek, ...szombatCsoport]
    .filter((p) => !manifest.includes(p))
    .sort((a, b) => a.localeCompare(b, "hu", { numeric: true }));

  if (toAdd.length === 0) {
    console.log("Nincs új bejegyzés (manifest naprakész).");
    console.log("webp fájlok:", diskFiles.length, "explicit Vasárnap manifest:", fromDiskExplicit.size);
    return;
  }

  const idx = manifest.findIndex((p) => String(p).startsWith("2025/"));
  const insertAt = idx === -1 ? manifest.length : idx;
  manifest.splice(insertAt, 0, ...toAdd);
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 4)}\n`, "utf8");
  console.log("Hozzáadva", toAdd.length, "útvonal a manifesthez (index", insertAt, ").");
}

main();
