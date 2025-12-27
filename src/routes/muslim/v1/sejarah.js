import { Hono } from 'hono';
import { getSejarah } from '../../../utils/jsonHandler.js';

const sejarah = new Hono();

// Get Sejarah List
sejarah.get('/', async (c) => {
  try {
    const kategori = c.req.query('kategori');
    const allSejarah = await getSejarah();
    if (!allSejarah) return c.json({ status: false, message: 'Daftar sejarah tidak tersedia.', data: [] }, 404);

    let data = allSejarah;
    if (kategori) {
      const kategoriLower = kategori.toLowerCase();
      data = allSejarah.filter(s => s.kategori && s.kategori.toLowerCase().includes(kategoriLower));
    }

    return c.json({
      status: true,
      message: kategori ? `Berhasil mendapatkan daftar sejarah kategori ${kategori}.` : 'Berhasil mendapatkan seluruh daftar sejarah.',
      data: data
    });
  } catch (error) {
    return c.json({ status: false, message: 'Gagal mendapatkan daftar sejarah: ' + error.message }, 500);
  }
});

// Get Sejarah Detail
sejarah.get('/detail', async (c) => {
  try {
    const id = c.req.query('id');
    if (!id) return c.json({ status: false, message: 'Parameter id diperlukan.' }, 400);

    const allSejarah = await getSejarah();
    if (!allSejarah) return c.json({ status: false, message: 'Daftar sejarah tidak tersedia.', data: {} }, 404);

    const item = allSejarah.find(s => s.id == id);
    
    if (!item) return c.json({ status: false, message: 'Data sejarah tidak ditemukan.', data: {} }, 404);
    
    return c.json({ status: true, message: 'Berhasil mendapatkan detail sejarah.', data: item });
  } catch (error) {
    return c.json({ status: false, message: 'Gagal mendapatkan detail sejarah: ' + error.message }, 500);
  }
});

// Get Sejarah Today (On This Day)
sejarah.get('/today', async (c) => {
  try {
    const today = new Date();
    const day = today.getDate();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const month = monthNames[today.getMonth()];
    
    const allSejarah = await getSejarah();
    if (!allSejarah) return c.json({ status: false, message: 'Daftar sejarah tidak tersedia.', data: [] }, 404);

    const searchStr = `${day} ${month}`;
    const data = allSejarah.filter(s => 
      (s.tahun && s.tahun.includes(searchStr)) || 
      (s.tahun && s.tahun.includes(month)) || 
      (s.deskripsi && s.deskripsi.includes(searchStr))
    ).slice(0, 10);

    return c.json({
      status: true,
      message: `Berhasil mendapatkan peristiwa sejarah untuk hari ini (${day} ${month}).`,
      data: {
        events: data,
        today: `${day} ${month}`
      }
    });
  } catch (error) {
    return c.json({ status: false, message: 'Gagal mendapatkan peristiwa sejarah hari ini: ' + error.message }, 500);
  }
});

export default sejarah;
