'use strict';
const path = require('path');

const noCache = (res) => res.set('Cache-Control', 'no-store');

const pages = (app) => {
    const p = (file) => path.join(__dirname, '..', 'pages', file);

    app.get('/',                 (_, res) => { noCache(res); res.sendFile(p('home/index.html')); });
    app.get(['/home', '/home/'], (_, res) => res.redirect(301, '/'));
    app.get('/about',            (_, res) => { noCache(res); res.sendFile(p('about/about.html')); });
    app.get('/blog',             (_, res) => { noCache(res); res.sendFile(p('blog/blog.html')); });
    app.get('/events',           (_, res) => { noCache(res); res.sendFile(p('events/events.html')); });
    app.get('/projects',         (_, res) => { noCache(res); res.sendFile(p('projects/projects.html')); });

    // Legacy redirect
    app.get('/news',             (_, res) => res.redirect(301, '/blog'));
};

module.exports = { pages };
