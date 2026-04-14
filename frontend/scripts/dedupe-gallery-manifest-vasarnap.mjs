import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAN = path.join(__dirname, "..", "public", "gallery-manifest.json");

const raw = fs.readFileSync(MAN, "utf8");
const man = JSON.parse(raw.replace(/^\uFEFF/, ""));

const explicitRe =
  /^2024\/08-augusztus\/Vasárnap\/Meccsek\/Meccsek_Vasárnap_Meccsek-(\d+)\.webp$/;
const legacyRe = /^2024\/Meccsek_Vasárnap_Meccsek-(\d+)\.webp$/;

const explicitIds = new Set();
for (const p of man) {
  const m = String(p).match(explicitRe);
  if (m) explicitIds.add(Number(m[1], 10));
}

const seenPath = new Set();
const seenVasExplicit = new Set();
const out = [];

for (const p of man) {
  const s = String(p);
  if (seenPath.has(s)) continue;

  const ex = s.match(explicitRe);
  if (ex) {
    const id = Number(ex[1], 10);
    if (seenVasExplicit.has(id)) continue;
    seenVasExplicit.add(id);
  }

  const leg = s.match(legacyRe);
  if (leg && explicitIds.has(Number(leg[1], 10))) continue;

  seenPath.add(s);
  out.push(p);
}

console.log("gallery-manifest:", man.length, "→", out.length);
fs.writeFileSync(MAN, `${JSON.stringify(out, null, 4)}\n`, "utf8");
