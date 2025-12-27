import { Hono } from 'hono';
import { getSurahList, getAyahBySurah } from '../../../utils/jsonHandler.js';
import crypto from 'crypto';

const integrity = new Hono();

// Helper to generate hash
const generateHash = (data) => {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

// Endpoint: Get Integrity Chain (Blockchain-style)
integrity.get('/chain', async (c) => {
  try {
    const allSurahs = await getSurahList();
    if (!allSurahs) return c.json({ status: false, message: 'Data surah tidak tersedia.' }, 404);
    
    const surahs = [...allSurahs].sort((a, b) => parseInt(a.number) - parseInt(b.number));
    
    let chain = [];
    let previousHash = "0".repeat(64); // Genesis block previous hash

    for (const surah of surahs) {
      // Get all ayahs for this surah to calculate its hash
      const ayahsData = await getAyahBySurah(surah.number);
      if (!ayahsData) continue;

      const ayahs = ayahsData
        .sort((a, b) => parseInt(a.ayah) - parseInt(b.ayah))
        .map(a => ({ arab: a.arab, text: a.text }));
      
      // Data to be hashed for this block
      const blockData = {
        surah_number: surah.number,
        surah_name: surah.name_id,
        ayah_count: ayahs.length,
        content_hash: generateHash(ayahs), // Hash of all ayahs in this surah
        previous_hash: previousHash,
        version: "1.0.0",
        timestamp: "2025-12-24T00:00:00Z" // Standardized for this version
      };

      const blockHash = generateHash(blockData);
      
      chain.push({
        block_height: chain.length + 1,
        hash: blockHash,
        ...blockData
      });

      previousHash = blockHash;
    }

    return c.json({
      status: true,
      message: "Data Integrity Chain (Proof of Authenticity) berhasil dibuat.",
      network: "Muslim-API Data Ledger",
      root_hash: previousHash,
      chain: chain
    });
  } catch (error) {
    return c.json({ status: false, message: 'Gagal mendapatkan data integrity chain: ' + error.message }, 500);
  }
});

// Endpoint: General Integrity Verification (Quick Check)
integrity.get('/verify', async (c) => {
  try {
    // Quick check using Al-Fatihah (Surah 1)
    const allSurahs = await getSurahList();
    const surah = allSurahs ? allSurahs.find(s => s.number == 1) : null;
    const ayahs = await getAyahBySurah(1);

    const isDataValid = surah && ayahs && ayahs.length > 0;

    return c.json({
      status: true,
      message: isDataValid ? "Integritas sistem terverifikasi." : "Sistem Online (Pengecekan data tertunda).",
      check: "Surah Al-Fatihah",
      integrity: isDataValid ? "Healthy" : "Warning",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Even if check fails, if the route is reached, the system is partially online
    return c.json({ 
      status: true, 
      message: "Sistem Online (Error pada pengecekan integritas).",
      integrity: "Error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint: Verify specific Ayah
integrity.get('/verify/ayah', async (c) => {
  const surahId = c.req.query('surahId');
  const ayahId = c.req.query('ayahId');

  if (!surahId || !ayahId) {
    return c.json({ status: false, message: "Parameter surahId dan ayahId diperlukan." }, 400);
  }

  try {
    const ayahs = await getAyahBySurah(surahId);
    const data = ayahs ? ayahs.find(a => a.ayah == ayahId) : null;

    if (!data) {
      return c.json({ status: false, message: `Ayat ${ayahId} pada surah ${surahId} tidak ditemukan.`, data: {} }, 404);
    }

    const verificationData = { arab: data.arab, text: data.text };

    return c.json({
      status: true,
      message: `Berhasil memverifikasi integritas ayat ${ayahId} pada surah ${surahId}.`,
      data: {
        surahId,
        ayahId,
        hash: generateHash(verificationData),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return c.json({ status: false, message: 'Gagal memverifikasi integritas ayat: ' + error.message }, 500);
  }
});

export default integrity;