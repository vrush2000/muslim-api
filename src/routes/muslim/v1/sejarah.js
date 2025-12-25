import { Hono } from 'hono';

const sejarah = new Hono();

// Data Sejarah Islam (Sample Dataset)
const dataSejarah = [
  {
    id: 1,
    peristiwa: "Kelahiran Nabi Muhammad SAW",
    tahun: "571 M (Tahun Gajah)",
    deskripsi: "Nabi Muhammad SAW lahir di Makkah dari pasangan Abdullah bin Abdul Muthalib dan Aminah binti Wahab.",
    kategori: "Sirah Nabawiyah"
  },
  {
    id: 2,
    peristiwa: "Turunnya Wahyu Pertama",
    tahun: "610 M",
    deskripsi: "Wahyu pertama (Surah Al-Alaq 1-5) turun di Gua Hira melalui Malaikat Jibril saat Nabi berusia 40 tahun.",
    kategori: "Sirah Nabawiyah"
  },
  {
    id: 3,
    peristiwa: "Hijrah ke Madinah",
    tahun: "622 M",
    deskripsi: "Perpindahan Nabi Muhammad SAW dan para sahabat dari Makkah ke Yatsrib (Madinah), menandai awal kalender Hijriah.",
    kategori: "Sirah Nabawiyah"
  },
  {
    id: 4,
    peristiwa: "Fathu Makkah",
    tahun: "630 M (8 Hijriah)",
    deskripsi: "Pembebasan kota Makkah oleh kaum muslimin tanpa pertumpahan darah yang berarti.",
    kategori: "Sirah Nabawiyah"
  },
  {
    id: 5,
    peristiwa: "Masuknya Islam ke Nusantara",
    tahun: "Abad ke-7 s/d 13 M",
    deskripsi: "Proses penyebaran Islam di Indonesia melalui perdagangan, perkawinan, dan dakwah para Wali Songo.",
    kategori: "Sejarah Indonesia"
  },
  {
    id: 6,
    peristiwa: "Berdirinya Kerajaan Samudera Pasai",
    tahun: "1267 M",
    deskripsi: "Kerajaan Islam pertama di Indonesia yang terletak di Aceh, menjadi pusat studi Islam di Asia Tenggara.",
    kategori: "Sejarah Indonesia"
  },
  {
    id: 7,
    peristiwa: "Resolusi Jihad",
    tahun: "22 Oktober 1945",
    deskripsi: "Fatwa KH Hasyim Asy'ari yang mewajibkan umat Islam berjuang melawan penjajah, kini diperingati sebagai Hari Santri.",
    kategori: "Sejarah Indonesia"
  },
  {
    id: 8,
    peristiwa: "Berdirinya Muhammadiyah",
    tahun: "18 November 1912",
    deskripsi: "Organisasi Islam modernis yang didirikan oleh KH Ahmad Dahlan di Yogyakarta untuk memurnikan ajaran Islam.",
    kategori: "Sejarah Indonesia"
  },
  {
    id: 9,
    peristiwa: "Berdirinya Nahdlatul Ulama (NU)",
    tahun: "31 Januari 1926",
    deskripsi: "Organisasi Islam tradisionalis yang didirikan oleh KH Hasyim Asy'ari untuk menjaga tradisi Aswaja di Nusantara.",
    kategori: "Sejarah Indonesia"
  }
];

// Data Tanya Jawab / Fatwa Ringkas (Muhammadiyah Tarjih & IslamQA Style)
const dataFatwa = [
  {
    id: 1,
    pertanyaan: "Apakah menyikat gigi membatalkan puasa?",
    jawaban: "Menyikat gigi saat puasa hukumnya mubah (boleh) selama tidak ada pasta atau air yang tertelan ke dalam kerongkongan. Namun, sebagian ulama menganggapnya makruh setelah waktu Dzuhur.",
    sumber: "Umum / Fatwa Kontemporer"
  },
  {
    id: 2,
    pertanyaan: "Hukum membayar zakat fitrah dengan uang?",
    jawaban: "Mayoritas ulama (Jumhur) mewajibkan dengan makanan pokok, namun Madzhab Hanafi dan banyak lembaga fatwa kontemporer (seperti MUI/Baznas/Tarjih) membolehkan konversi ke nilai uang untuk kemaslahatan penerima.",
    sumber: "MUI / Majelis Tarjih"
  },
  {
    id: 3,
    pertanyaan: "Hukum bunga bank dalam perspektif Tarjih Muhammadiyah?",
    jawaban: "Majelis Tarjih Muhammadiyah dalam Putusan Tarjih tahun 2010 menyatakan bahwa bunga bank (interest) termasuk kategori riba yang dilarang, dan mendorong penggunaan sistem perbankan syariah.",
    sumber: "Majelis Tarjih Muhammadiyah"
  },
  {
    id: 4,
    pertanyaan: "Bagaimana hukum kripto menurut lembaga fatwa?",
    jawaban: "Ijtimah Ulama MUI menyatakan penggunaan kripto sebagai mata uang adalah haram karena mengandung gharar dan dharar. Namun sebagai aset komoditas yang memiliki underlying asset, hukumnya boleh (mubah) dengan syarat tertentu.",
    sumber: "MUI / Ijtima Ulama"
  },
  {
    id: 5,
    pertanyaan: "Hukum rokok menurut fatwa ulama?",
    jawaban: "MUI dan Majelis Tarjih Muhammadiyah telah mengeluarkan fatwa haram terhadap rokok karena sifatnya yang merusak kesehatan (mudharat), sementara sebagian ulama lainnya menganggapnya makruh.",
    sumber: "MUI / Majelis Tarjih"
  }
];

sejarah.get('/', (c) => {
  const kategori = c.req.query('kategori');
  let data = dataSejarah;
  
  if (kategori) {
    data = dataSejarah.filter(s => s.kategori.toLowerCase().includes(kategori.toLowerCase()));
  }

  return c.json({
    status: true,
    data: data
  });
});

sejarah.get('/detail', (c) => {
  const id = c.req.query('id');
  const item = dataSejarah.find(s => s.id == id);
  if (!item) return c.json({ status: false, message: 'Data tidak ditemukan' }, 404);
  return c.json({ status: true, data: item });
});

sejarah.get('/tanya-jawab', (c) => {
  return c.json({
    status: true,
    data: dataFatwa
  });
});

export default sejarah;
