import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'src', 'database', 'alquran.db');
const db = new Database(dbPath);

const dataDir = join(__dirname, 'src', 'data');
const quranDir = join(dataDir, 'quran');
const ayahDir = join(quranDir, 'ayah');
const commonDir = join(dataDir, 'common');
const haditsDir = join(dataDir, 'hadits');

// Ensure directories exist
[dataDir, quranDir, ayahDir, commonDir, haditsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. Export Surah
console.log('Exporting Surah...');
const surahs = db.prepare("SELECT * FROM surah").all();
fs.writeFileSync(join(quranDir, 'surah.json'), JSON.stringify(surahs, null, 2));

// 2. Export Ayah (split by surah)
console.log('Exporting Ayah...');
for (const surah of surahs) {
  const ayahs = db.prepare("SELECT * FROM ayah WHERE surah = ?").all(surah.number);
  fs.writeFileSync(join(ayahDir, `${surah.number}.json`), JSON.stringify(ayahs, null, 2));
}

// 3. Export Doa
console.log('Exporting Doa...');
const doas = db.prepare("SELECT * FROM doa").all();
fs.writeFileSync(join(commonDir, 'doa.json'), JSON.stringify(doas, null, 2));

// 4. Export Hadits Arbain
console.log('Exporting Hadits Arbain...');
const haditsArbain = db.prepare("SELECT * FROM hadits").all();
fs.writeFileSync(join(haditsDir, 'arbain.json'), JSON.stringify(haditsArbain, null, 2));

// 5. Export Asmaul Husna
console.log('Exporting Asmaul Husna...');
const asma = db.prepare("SELECT * FROM asmaul_husna").all();
fs.writeFileSync(join(commonDir, 'asmaul_husna.json'), JSON.stringify(asma, null, 2));

// 6. Export Dzikir
console.log('Exporting Dzikir...');
const dzikir = db.prepare("SELECT * FROM dzikir").all();
fs.writeFileSync(join(commonDir, 'dzikir.json'), JSON.stringify(dzikir, null, 2));

// 7. Export Theme (for semantic search)
console.log('Exporting Themes...');
const themes = db.prepare("SELECT * FROM theme").all();
fs.writeFileSync(join(quranDir, 'themes.json'), JSON.stringify(themes, null, 2));

// 8. Export Juz
console.log('Exporting Juz...');
const juz = db.prepare("SELECT * FROM juz").all();
fs.writeFileSync(join(quranDir, 'juz.json'), JSON.stringify(juz, null, 2));

// 9. Export Tafsir
console.log('Exporting Tafsir...');
const tafsir = db.prepare("SELECT * FROM tafsir").all();
fs.writeFileSync(join(quranDir, 'tafsir.json'), JSON.stringify(tafsir, null, 2));

// 10. Export Word
console.log('Exporting Word...');
const word = db.prepare("SELECT * FROM word").all();
fs.writeFileSync(join(quranDir, 'word.json'), JSON.stringify(word, null, 2));

// 11. Export Asbab Nuzul
console.log('Exporting Asbab Nuzul...');
const asbab = db.prepare("SELECT * FROM asbab_nuzul").all();
fs.writeFileSync(join(quranDir, 'asbab_nuzul.json'), JSON.stringify(asbab, null, 2));

// 12. Export Sejarah
console.log('Exporting Sejarah...');
const sejarah = db.prepare("SELECT * FROM sejarah").all();
fs.writeFileSync(join(commonDir, 'sejarah.json'), JSON.stringify(sejarah, null, 2));

// 13. Export Qari
console.log('Exporting Qari...');
const qari = db.prepare("SELECT * FROM qari").all();
fs.writeFileSync(join(commonDir, 'qari.json'), JSON.stringify(qari, null, 2));

// 14. Export Calendar
console.log('Exporting Calendar...');
const c_months = db.prepare("SELECT * FROM calendar_months").all();
fs.writeFileSync(join(commonDir, 'calendar_months.json'), JSON.stringify(c_months, null, 2));
const c_days = db.prepare("SELECT * FROM calendar_days").all();
fs.writeFileSync(join(commonDir, 'calendar_days.json'), JSON.stringify(c_days, null, 2));

// 15. Export Masjid
console.log('Exporting Masjid...');
const masjid = db.prepare("SELECT * FROM masjid").all();
fs.writeFileSync(join(commonDir, 'masjid.json'), JSON.stringify(masjid, null, 2));

console.log('Export completed!');
db.close();
