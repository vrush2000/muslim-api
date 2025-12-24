import { handle } from 'hono/vercel';
import app from './src/app.jsx';

// Vercel Serverless Functions (Node.js) expect a default export that handles (req, res)
// or specific HTTP method exports for Edge Functions.
// For @vercel/node, we use the handle(app) which returns (req, res) => void.

const handler = handle(app);

export default (req, res) => {
  return handler(req, res);
};
