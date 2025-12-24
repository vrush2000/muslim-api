import { getRequestListener } from '@hono/node-server';
import app from './src/app.jsx';

export default getRequestListener(app);
