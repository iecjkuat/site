'use strict';
/**
 * Page routes — maps clean URLs to HTML files
 * All in one place so adding a new page is a one-liner
 */

const path = require('path');

const pages = (app) => {
  const p = (file) => path.join(__dirname, '..', 'pages', file);

  app.get('/',                  (_, res) => res.sendFile(p('home/index.html')));
  app.get(['/home', '/home/'],  (_, res) => res.redirect(301, '/'));
  app.get('/dashboard',         (_, res) => res.sendFile(p('dashboard/dashboard.html')));
  app.get('/events',            (_, res) => res.sendFile(p('events/events.html')));
  app.get('/projects',          (_, res) => res.sendFile(p('projects/projects.html')));
  app.get('/ideas',             (_, res) => res.sendFile(p('ideas/ideas.html')));
  app.get('/news',              (_, res) => res.sendFile(p('news/news.html')));
  app.get('/payment',           (_, res) => res.sendFile(p('payment/payment.html')));
  app.get('/resources',         (_, res) => res.sendFile(p('resources/resources.html')));
  app.get('/opportunities',     (_, res) => res.sendFile(p('opportunities/opportunities.html')));
  app.get('/support',           (_, res) => res.sendFile(p('support/support-modern.html')));
  app.get('/settings',          (_, res) => res.sendFile(p('settings/settings.html')));
  app.get('/admin',             (_, res) => res.sendFile(p('admin/admin.html')));
  app.get('/cms',               (_, res) => res.sendFile(p('cms/cms.html')));
  app.get('/leadership',        (_, res) => res.sendFile(p('leadership/leadership.html')));
  app.get('/voting',            (_, res) => res.sendFile(p('voting/voting.html')));
  app.get('/feedback',          (_, res) => res.sendFile(p('feedback/feedback.html')));
  app.get('/signup',            (_, res) => res.sendFile(p('auth/signup.html')));
  app.get('/signin',            (_, res) => res.sendFile(p('auth/signin.html')));
  app.get('/verify-email',      (_, res) => res.sendFile(p('verify-email/verify-email.html')));
  app.get('/reset-password',    (_, res) => res.sendFile(p('reset-password/reset-password.html')));
  app.get('/complete-profile',  (_, res) => res.sendFile(p('complete-profile/complete-profile.html')));
  app.get('/complete-registration', (_, res) => res.sendFile(p('complete-registration/complete-registration-new.html')));
  app.get('/terms',             (_, res) => res.sendFile(p('terms/terms.html')));
  app.get('/privacy',           (_, res) => res.sendFile(p('privacy/privacy.html')));
};

module.exports = { pages };
