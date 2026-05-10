'use strict';
const path = require('path');

const noCache = (res) => res.set('Cache-Control', 'no-store');

const pages = (app) => {
    const p = (file) => path.join(__dirname, '..', 'pages', file);

    app.get('/',                 (_, res) => { noCache(res); res.sendFile(p('home/index.html')); });
    app.get(['/home', '/home/'], (_, res) => res.redirect(301, '/'));
    app.get('/blog',             (_, res) => { noCache(res); res.sendFile(p('blog/blog.html')); });
    app.get('/events',           (_, res) => { noCache(res); res.sendFile(p('events/events.html')); });
    app.get('/projects',         (_, res) => { noCache(res); res.sendFile(p('projects/projects.html')); });
    app.get('/merchandise',      (_, res) => { noCache(res); res.sendFile(p('merchandise/merchandise.html')); });

    // Legacy redirects
    app.get('/news', (_, res) => res.redirect(301, '/blog'));
    app.get('/about', (_, res) => res.redirect(301, '/'));

    // Admin — hidden URL, no-index
    app.get(['/iec-admin', '/iec-admin/'], (_, res) => { noCache(res); res.sendFile(p('iec-admin/login.html')); });
    app.get('/iec-admin/dashboard',        (_, res) => { noCache(res); res.sendFile(p('iec-admin/dashboard.html')); });
};

module.exports = { pages };
