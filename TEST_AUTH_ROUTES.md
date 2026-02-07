# Auth Routes Testing Guide

## Issue
Getting 404 when visiting `/signin` page.

## Root Cause
The server needs to be restarted to pick up the new routes that were added to `server.js`.

## Solution
Restart the Node.js server.

### Option 1: Kill and Restart (Recommended)
```powershell
# Kill the current server process
taskkill /F /PID 27144

# Start the server again
node server.js
```

### Option 2: Use Ctrl+C in the terminal where server is running
1. Go to the terminal where `node server.js` is running
2. Press `Ctrl + C` to stop the server
3. Run `node server.js` again

## Verification
After restarting, test these URLs:
- http://localhost:3000/signup - Should show signup page
- http://localhost:3000/signin - Should show signin page

## Routes Added to server.js
```javascript
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'auth', 'signup.html'));
});

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'auth', 'signin.html'));
});
```

## Files Created
✅ pages/auth/signup.html
✅ pages/auth/signin.html
✅ pages/auth/signup.js
✅ pages/auth/signin.js
✅ pages/auth/auth.css

All files exist and are ready to serve.

## Why Restart is Needed
Node.js loads the server.js file once at startup. Any changes to routes require a server restart to take effect. This is normal behavior for Node.js applications without hot-reload.

## Alternative: Use nodemon for Auto-Restart
To avoid manual restarts during development, you can use nodemon:

```bash
# Install nodemon globally
npm install -g nodemon

# Run server with nodemon
nodemon server.js
```

With nodemon, the server will automatically restart when you change server.js.
