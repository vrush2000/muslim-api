import { Hono } from 'hono';

const kemenag = new Hono();

// Data Hari Libur Nasional (Source: https://github.com/kresnasatya/api-harilibur)
kemenag.get('/libur', async (c) => {
  const year = c.req.query('year') || new Date().getFullYear().toString();
  try {
    const response = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`);
    if (!response.ok) {
      return c.json({ status: false, message: `Data libur tahun ${year} tidak ditemukan` }, 404);
    }
    const data = await response.json();
    
    // Map data to maintain consistent internal format
    const mappedData = data.map(item => ({
      tanggal: item.holiday_date,
      keterangan: item.holiday_name,
      is_cuti: !item.is_national_holiday
    }));

    return c.json({
      status: true,
      year: year,
      data: mappedData
    });
  } catch (error) {
    return c.json({ status: false, message: error.message }, 500);
  }
});

// Data Pesantren (Source: https://github.com/nasrul21/data-pesantren-indonesia)
kemenag.get('/provinsi', async (c) => {
  try {
    const response = await fetch('https://api-pesantren-indonesia.vercel.app/provinsi.json');
    if (!response.ok) return c.json({ status: false, message: 'Gagal mengambil data provinsi' }, response.status);
    const data = await response.json();
    return c.json({ status: true, data });
  } catch (error) {
    return c.json({ status: false, message: error.message }, 500);
  }
});

kemenag.get('/kabupaten', async (c) => {
  const provinsiId = c.req.query('provinsiId');
  if (!provinsiId) return c.json({ status: false, message: 'provinsiId is required' }, 400);
  try {
    const response = await fetch(`https://api-pesantren-indonesia.vercel.app/kabupaten/${provinsiId}.json`);
    if (!response.ok) return c.json({ status: false, message: `Gagal mengambil data kabupaten untuk provinsi ID ${provinsiId}` }, response.status);
    const data = await response.json();
    return c.json({ status: true, data });
  } catch (error) {
    return c.json({ status: false, message: error.message }, 500);
  }
});

kemenag.get('/pesantren', async (c) => {
  const kabupatenId = c.req.query('kabupatenId');
  if (!kabupatenId) return c.json({ status: false, message: 'kabupatenId is required' }, 400);
  try {
    const response = await fetch(`https://api-pesantren-indonesia.vercel.app/pesantren/${kabupatenId}.json`);
    if (!response.ok) return c.json({ status: false, message: `Data pesantren untuk kabupaten ID ${kabupatenId} tidak ditemukan` }, response.status);
    const data = await response.json();
    return c.json({ status: true, data });
  } catch (error) {
    return c.json({ status: false, message: error.message }, 500);
  }
});

// Data Masjid (Sample Dataset - Major Mosques in Indonesia)
const dataMasjid = [
  { id: 1, nama: "Masjid Istiqlal", lokasi: "Jakarta Pusat, DKI Jakarta", kapasitas: "200.000", tahun_berdiri: "1978", deskripsi: "Masjid terbesar di Asia Tenggara." },
  { id: 2, nama: "Masjid Raya Baiturrahman", lokasi: "Banda Aceh, Aceh", kapasitas: "30.000", tahun_berdiri: "1881", deskripsi: "Simbol agama, budaya, dan perjuangan rakyat Aceh." },
  { id: 3, nama: "Masjid Agung Jawa Tengah", lokasi: "Semarang, Jawa Tengah", kapasitas: "15.000", tahun_berdiri: "2006", deskripsi: "Terkenal dengan payung raksasa otomatis seperti di Masjid Nabawi." },
  { id: 4, nama: "Masjid Al-Jabbar", lokasi: "Bandung, Jawa Barat", kapasitas: "33.000", tahun_berdiri: "2022", deskripsi: "Masjid terapung dengan desain kontemporer yang ikonik." },
  { id: 5, nama: "Masjid Nasional Al-Akbar", lokasi: "Surabaya, Jawa Timur", kapasitas: "59.000", tahun_berdiri: "2000", deskripsi: "Masjid terbesar kedua di Indonesia." }
];

kemenag.get('/masjid', (c) => {
  return c.json({
    status: true,
    data: dataMasjid
  });
});

export default kemenag;
