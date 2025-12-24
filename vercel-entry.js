import { handle } from 'hono/vercel';
import app from './src/app.jsx';

export default (req, res) => {
  // 1. Fix Invalid URL error: Pastikan req.url adalah URL absolut
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['host'];
  if (req.url && !req.url.startsWith('http')) {
    req.url = `${protocol}://${host}${req.url}`;
  }

  // 2. Fix TypeError: headers.get is not a function
  if (req.headers && typeof req.headers.get !== 'function') {
    req.headers.get = function(name) {
      return this[name.toLowerCase()] || null;
    }.bind(req.headers);
  }

  // Panggil handler hono/vercel
  const handler = handle(app);
  return handler(req, res);
};
