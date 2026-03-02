# Background Image Update Progress

## Completed Pages (5/16)
✅ pages/events/events.html
✅ pages/ideas/ideas.html
✅ pages/projects/projects.html
✅ pages/home/index.html
✅ pages/dashboard/dashboard.html

## Remaining Pages (11/16)
⏳ pages/news/news.html
⏳ pages/resources/resources.html
⏳ pages/opportunities/opportunities.html
⏳ pages/leadership/leadership.html
⏳ pages/voting/voting.html
⏳ pages/payment/payment.html
⏳ pages/settings/settings.html
⏳ pages/feedback/feedback.html
⏳ pages/support/support-modern.html
⏳ pages/privacy/privacy.html
⏳ pages/terms/terms.html

## Style Block to Add
```html
<style>
  body {
    background: url('/pages/shared/assets/images/backgrounds/tech-meeting-flatlay.jpg') !important;
    background-attachment: fixed !important;
    background-size: cover !important;
    background-position: center !important;
    position: relative !important;
  }
  
  body::before {
    content: '' !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: url('/pages/shared/assets/images/backgrounds/tech-meeting-flatlay.jpg') !important;
    background-attachment: fixed !important;
    background-size: cover !important;
    background-position: center !important;
    opacity: 0.6 !important;
    z-index: -1 !important;
  }
</style>
```

This should be added in the `<head>` section after the CSS links and before the closing `</head>` tag.
