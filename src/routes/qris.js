import { Hono } from 'hono';
import { qrisdynamicgenerator } from "@misterdevs/qris-static-to-dynamic";
import QRCode from 'qrcode';

const router = new Hono();

// Ganti dengan QRIS statis Anda (Contoh: Misterdevs)
const STATIC_QRIS = "00020101021126570011ID.DANA.WWW011893600915314378691502091437869150303UMI51440014ID.CO.QRIS.WWW0215ID10210738442970303UMI5204899953033605802ID5916Hariistimewa.com6015Kota Jakarta Se6105128206304D1F0";

router.get('/generate', async (c) => {
  const amount = parseInt(c.req.query('amount'));
  
  if (!amount || isNaN(amount)) {
    return c.json({ status: 400, message: 'Amount is required and must be a number' }, 400);
  }

  try {
    const qrisDynamic = qrisdynamicgenerator(STATIC_QRIS, amount);
    
    // Menggunakan qrcode.toString dengan type: 'svg' adalah cara paling aman 
    // untuk lingkungan serverless karena tidak bergantung pada modul 'fs' atau canvas.
    const qrSvg = await QRCode.toString(qrisDynamic, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'M'
    });

    // Konversi SVG ke Base64 agar tetap kompatibel dengan frontend yang mengharapkan URL gambar
    const qrImage = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;

    return c.json({
      status: 200,
      data: {
        amount,
        qris_string: qrisDynamic,
        qr_image: qrImage
      }
    });
  } catch (error) {
    return c.json({ status: 500, message: error.message }, 500);
  }
});

export default router;
