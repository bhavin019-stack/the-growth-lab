import app from '../server/index.js';

export default function handler(req, res) {
  try {
    if (req.headers['x-matched-path']) {
      req.url = req.headers['x-matched-path'];
    }
    if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
      req.url = '/api' + req.url;
    }
    return app(req, res);
  } catch (err) {
    console.error('Vercel API Handler Error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
