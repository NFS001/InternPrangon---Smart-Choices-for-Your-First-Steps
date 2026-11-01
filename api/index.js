const app = require('../backend/server');

module.exports = (req, res) => {
  // Normalize req.url so routes mounted at /api always match regardless of Vercel rewrite prefix handling
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
