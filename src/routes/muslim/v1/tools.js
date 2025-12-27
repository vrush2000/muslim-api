import { Hono } from 'hono';
import { getSurahList, getAyahBySurah, getHaditsArbain, getLocalHadits } from '../../../utils/jsonHandler.js';

const tools = new Hono();

// Daily Quotes (Ayat/Hadits Hari Ini)
tools.get('/quotes/daily', async (c) => {
  try {
    const surahList = await getSurahList();
    if (!surahList) throw new Error('Daftar surah tidak tersedia');

    // Pilih surah acak
    const randomSurah = surahList[Math.floor(Math.random() * surahList.length)];
    const ayahs = await getAyahBySurah(randomSurah.number);
    if (!ayahs) throw new Error('Daftar ayat tidak tersedia');

    // Pilih ayat acak
    const randomAyah = ayahs[Math.floor(Math.random() * ayahs.length)];
    const surahName = randomSurah.name_id || randomSurah.name_en || randomSurah.name_long;

    // Ambil 1 hadits arbain acak
    const allArbain = await getHaditsArbain();
    const randomHadits = allArbain ? allArbain[Math.floor(Math.random() * allArbain.length)] : null;

    return c.json({
      status: true,
      message: 'Berhasil mengambil kutipan harian.',
      data: {
        ayat: {
          arab: randomAyah.arab,
          text: randomAyah.text,
          sumber: `QS. ${surahName}: ${randomAyah.ayah}`
        },
        hadits: randomHadits ? {
          arab: randomHadits.arab,
          text: randomHadits.indo,
          sumber: `Hadits Arbain No. ${randomHadits.no}: ${randomHadits.judul}`
        } : null
      }
    });
  } catch (error) {
    return c.json({ status: false, message: 'Gagal mengambil kutipan harian: ' + error.message }, 500);
  }
});

// Kalkulator Zakat
tools.get('/zakat', (c) => {
  const type = c.req.query('type'); // maal, penghasilan, fitrah
  const amount = parseFloat(c.req.query('amount') || 0);
  const hargaEmas = parseFloat(c.req.query('hargaEmas') || 1200000); // Default harga emas per gram

  if (!type) {
    return c.json({ 
      status: false, 
      message: 'Parameter type (maal/penghasilan/fitrah) diperlukan.' 
    }, 400);
  }

  if (isNaN(amount) || amount <= 0) {
    return c.json({ 
      status: false, 
      message: 'Parameter amount harus berupa angka valid dan lebih besar dari 0.' 
    }, 400);
  }

  let result = {
    status: true,
    message: 'Kalkulasi zakat berhasil.',
    data: {
      type: type,
      amount: amount,
      nishab: 0,
      isWajib: false,
      zakat: 0
    }
  };

  if (type === 'maal') {
    const nishabEmas = 85 * hargaEmas;
    result.data.nishab = nishabEmas;
    result.data.isWajib = amount >= nishabEmas;
    result.data.zakat = result.data.isWajib ? amount * 0.025 : 0;
    result.data.keterangan = 'Nishab Zakat Maal adalah setara 85 gram emas per tahun. Tarif zakat 2,5%.';
  } 
  else if (type === 'penghasilan') {
    const nishabEmasBulan = (85 * hargaEmas) / 12;
    result.data.nishab = nishabEmasBulan;
    result.data.isWajib = amount >= nishabEmasBulan;
    result.data.zakat = result.data.isWajib ? amount * 0.025 : 0;
    result.data.keterangan = 'Nishab Zakat Penghasilan setara 85 gram emas per tahun (dibagi 12 bulan). Tarif 2,5%.';
  }
  else if (type === 'fitrah') {
    const hargaBeras = parseFloat(c.req.query('hargaBeras') || 15000);
    const jumlahOrang = parseInt(c.req.query('jumlahOrang') || 1);
    const zakatPerOrang = 2.5 * hargaBeras; // 2.5 kg atau 3.5 liter beras
    result.data.nishab = 0;
    result.data.isWajib = true;
    result.data.zakat = zakatPerOrang * jumlahOrang;
    result.data.keterangan = `Zakat Fitrah adalah 2.5kg beras per jiwa. Estimasi Rp${zakatPerOrang.toLocaleString('id-ID')} per jiwa.`;
  } else {
    return c.json({ status: false, message: 'Tipe zakat tidak valid. Gunakan: maal, penghasilan, atau fitrah.' }, 400);
  }

  return c.json(result);
});

// Qibla Direction (Arah Kiblat)
tools.get('/qibla', async (c) => {
  const lat = parseFloat(c.req.query('lat'));
  const lng = parseFloat(c.req.query('lng'));

  if (isNaN(lat) || isNaN(lng)) {
    return c.json({ status: false, message: 'Parameter lat dan lng diperlukan dan harus berupa angka.' }, 400);
  }

  // Kaaba coordinates
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;

  // Formula: tan(q) = sin(ΔL) / (cos(φ1)tan(φ2) - sin(φ1)cos(ΔL))
  const dL = (kaabaLng - lng) * Math.PI / 180;
  const phi1 = lat * Math.PI / 180;
  const phi2 = kaabaLat * Math.PI / 180;

  const q = Math.atan2(Math.sin(dL), (Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dL)));
  const direction = (q * 180 / Math.PI + 360) % 360;

  return c.json({
    status: true,
    message: 'Berhasil menghitung arah kiblat.',
    data: {
      coordinates: { lat, lng },
      kaaba: { lat: kaabaLat, lng: kaabaLng },
      qibla_direction: direction,
      unit: 'degrees'
    }
  });
});

// Semantic Search (RAG-lite) - Mencari berdasarkan kata kunci di Quran & Hadits
tools.get('/semantic-search', async (c) => {
  const query = c.req.query('query');

  if (!query) return c.json({ status: false, message: 'Parameter query diperlukan.' }, 400);

  try {
    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(' ');

    // Cari di Quran
    const surahList = await getSurahList();
    let quranResults = [];
    
    for (const s of surahList) {
      const ayahs = await getAyahBySurah(s.number);
      if (ayahs) {
        const matches = ayahs.filter(a => {
          const text = (a.text || '').toLowerCase();
          return searchTerms.every(term => text.includes(term));
        }).slice(0, 5);

        if (matches.length > 0) {
          const surahName = s.name_id || s.name_en || s.name_long;
          quranResults.push(...matches.map(a => ({
            arab: a.arab,
            text: a.text,
            sumber: `QS. ${surahName}: ${a.ayah}`
          })));
        }
      }
      if (quranResults.length >= 10) break;
    }

    // Cari di Hadits Arbain
    const allArbain = await getHaditsArbain();
    const arbainMatches = allArbain ? allArbain.filter(h => {
      const text = (h.judul + ' ' + h.indo).toLowerCase();
      return searchTerms.every(term => text.includes(term));
    }).slice(0, 5) : [];

    const formattedArbain = arbainMatches.map(h => ({
      arab: h.arab,
      text: h.indo,
      sumber: `Hadits Arbain No. ${h.no}: ${h.judul}`
    }));

    // Cari di Kitab Utama (Bukhari & Muslim) secara lokal
    let globalHadits = [];
    const mainBooks = ['bukhari', 'muslim'];

    for (const book of mainBooks) {
      const allHadits = await getLocalHadits(book);
      if (allHadits) {
        const matches = allHadits.filter(h => {
          const text = (h.id || '').toLowerCase();
          return searchTerms.every(term => text.includes(term));
        }).slice(0, 3);

        const bookName = book.charAt(0).toUpperCase() + book.slice(1);
        globalHadits.push(...matches.map(h => ({
          arab: h.arab,
          text: h.id,
          sumber: `HR. ${bookName} No. ${h.number}`
        })));
      }
      if (globalHadits.length >= 6) break;
    }

    const totalHadits = [...formattedArbain, ...globalHadits];

    if (quranResults.length === 0 && totalHadits.length === 0) {
      return c.json({
        status: false,
        message: `Tidak ada hasil pencarian semantik untuk '${query}'.`,
        data: {
          query: query,
          quran: [],
          hadits: []
        }
      }, 404);
    }

    return c.json({
      status: true,
      message: `Pencarian semantik untuk '${query}' berhasil.`,
      data: {
        query: query,
        quran: quranResults,
        hadits: totalHadits
      }
    });
  } catch (error) {
    return c.json({ status: false, message: 'Pencarian semantik gagal: ' + error.message }, 500);
  }
});

export default tools;
