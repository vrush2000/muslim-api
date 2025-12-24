import { handle } from 'hono/vercel';
import app from './src/app.jsx';

// Hono Vercel Adapter secara otomatis menangani URL dan Header jika digunakan langsung
export default handle(app);
