// Builds one "all decks" ZIP per language from the flashcard CSVs.
//
// Dependency-free: writes a minimal ZIP with STORED (uncompressed) entries, so
// it works anywhere Node runs (no native `zip`, no npm packages). The CSVs are
// tiny text files, so skipping compression costs nothing meaningful.
//
// Output: public/downloads/<lang>/<lang>-flashcards.zip
// Run via `npm run zip`, and automatically before `npm run build` (prebuild).

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const FLASHCARDS_DIR = join(ROOT, 'public', 'flashcards');
const DOWNLOADS_DIR = join(ROOT, 'public', 'downloads');

// --- CRC-32 (required by the ZIP spec, even for stored entries) --------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// --- Minimal ZIP writer ------------------------------------------------------

const DOS_TIME = 0; // 00:00:00
const DOS_DATE = 0x0021; // 1980-01-01 (earliest representable)

/** @param {{name: string, data: Buffer}[]} files */
function buildZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0); // local file header signature
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // method: stored
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18); // compressed size
    local.writeUInt32LE(data.length, 22); // uncompressed size
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28); // extra length
    nameBuf.copy(local, 30);
    locals.push(local, data);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0); // central dir header signature
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0, 8); // flags
    central.writeUInt16LE(0, 10); // method
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30); // extra length
    central.writeUInt16LE(0, 32); // comment length
    central.writeUInt16LE(0, 34); // disk number start
    central.writeUInt16LE(0, 36); // internal attrs
    central.writeUInt32LE(0, 38); // external attrs
    central.writeUInt32LE(offset, 42); // local header offset
    nameBuf.copy(central, 46);
    centrals.push(central);

    offset += local.length + data.length;
  }

  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // end of central dir signature
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // disk with central dir
  eocd.writeUInt16LE(files.length, 8); // entries on this disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralDir.length, 12); // central dir size
  eocd.writeUInt32LE(offset, 16); // central dir offset
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...locals, centralDir, eocd]);
}

// --- Main --------------------------------------------------------------------

function main() {
  if (!existsSync(FLASHCARDS_DIR)) {
    console.log('[zip] No public/flashcards directory; nothing to do.');
    return;
  }

  const langs = readdirSync(FLASHCARDS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let built = 0;
  for (const lang of langs) {
    const langDir = join(FLASHCARDS_DIR, lang);
    const csvs = readdirSync(langDir).filter((f) => f.endsWith('.csv')).sort();
    if (csvs.length === 0) continue;

    const files = csvs.map((name) => ({
      name: `language-transfer-${lang}-flashcards/${name}`,
      data: readFileSync(join(langDir, name)),
    }));

    const outDir = join(DOWNLOADS_DIR, lang);
    mkdirSync(outDir, { recursive: true });
    const outFile = join(outDir, `${lang}-flashcards.zip`);
    writeFileSync(outFile, buildZip(files));

    console.log(`[zip] ${lang}: ${csvs.length} decks → public/downloads/${lang}/${lang}-flashcards.zip`);
    built++;
  }

  console.log(`[zip] Done — ${built} archive(s) written.`);
}

main();
