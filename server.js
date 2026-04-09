'use strict';
require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security ────────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({ origin: '*' }));

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static assets ───────────────────────────────────────────────────────────
const root = __dirname;
app.use('/shared',   express.static(path.join(root, 'shared')));
app.use('/assets',   express.static(path.join(root, 'shared', 'assets')));
app.use('/blog',     express.static(path.join(root, 'pages', 'blog')));
app.use('/events',   express.static(path.join(root, 'pages', 'events')));
app.use('/projects', express.static(path.join(root, 'pages', 'projects')));
app.use('/about',    express.static(path.join(root, 'pages', 'about')));
app.use(express.static(path.join(root, 'public')));

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Page Routes ─────────────────────────────────────────────────────────────
const { pages } = require('./config/routes');
pages(app);

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/membership', require('./api/membership'));

// ── 404 (SAFE VERSION - NO FILE DEPENDENCY) ────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      <style>
        body {
          font-family: Arial;
          background: #0f172a;
          color: white;
          text-align: center;
          padding: 80px;
        }
        a { color: #10b981; }
      </style>
    </head>
    <body>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Go Home</a>
    </body>
    </html>
  `);
});

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

module.exports = app;