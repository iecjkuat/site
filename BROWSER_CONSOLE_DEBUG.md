# Browser Console Debugging Commands

## Run these commands in the browser console on the CMS page

### 1. Check if CMS Manager exists
```javascript
console.log('CMS Manager:', window.cmsManager);
console.log('Feedback Manager:', window.cmsManager?.feedbackManager);
```

### 2. Check if containers exist
```javascript
console.log('Whispers container:', document.getElementById('whispers-list'));
console.log('Reviews container:', document.getElementById('reviews-list'));
console.log('Feedback tab:', document.getElementById('feedback-tab'));
```

### 3. Manually load whispers
```javascript
if (window.cmsManager?.feedbackManager) {
    window.cmsManager.feedbackManager.loadWhispers();
} else {
    console.error('Feedback manager not found!');
}
```

### 4. Test API directly from console
```javascript
const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
fetch('/api/v1/feedback-simple/whispers', {
    headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
    console.log('API Response:', data);
    console.log('Whispers count:', data.feedback?.length);
})
.catch(err => console.error('API Error:', err));
```

### 5. Check current tab
```javascript
console.log('Current tab:', window.cmsManager?.currentTab);
console.log('Feedback tab active?:', document.getElementById('feedback-tab')?.classList.contains('active'));
```

### 6. Force switch to feedback tab
```javascript
if (window.cmsManager) {
    window.cmsManager.switchTab('feedback');
}
```

### 7. Check if feedback manager loaded
```javascript
console.log('Feedback manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.cmsManager?.feedbackManager || {})));
```

### 8. Full diagnostic
```javascript
console.log('=== CMS FEEDBACK DIAGNOSTIC ===');
console.log('1. CMS Manager exists:', !!window.cmsManager);
console.log('2. Feedback Manager exists:', !!window.cmsManager?.feedbackManager);
console.log('3. Current tab:', window.cmsManager?.currentTab);
console.log('4. Whispers container exists:', !!document.getElementById('whispers-list'));
console.log('5. Feedback tab exists:', !!document.getElementById('feedback-tab'));
console.log('6. Feedback tab active:', document.getElementById('feedback-tab')?.classList.contains('active'));
console.log('7. Auth token exists:', !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken')));
console.log('================================');
```
