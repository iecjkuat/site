# Login Button Redirect Update

## Overview
Updated all login/signup buttons across the site to redirect to standalone auth pages instead of showing modals.

## Changes Made

### 1. **pages/shared/global-navbar.js**
Updated `handleAuthButtonClick` method:
- **Before**: Called `this.showAuthModal('login')` to show modal
- **After**: Redirects to `/signin` page with `window.location.href = '/signin'`

```javascript
handleAuthButtonClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isLoggedIn = window.authManager?.isAuthenticated?.();
    
    if (isLoggedIn) {
        console.log('🔐 Logout clicked');
        if (window.authManager) {
            await window.authManager.logout();
        }
    } else {
        console.log('🔐 Login clicked - redirecting to signin page');
        window.location.href = '/signin';  // ← CHANGED
    }
}
```

### 2. **pages/home/home.js**
Updated button handlers in `attachButtonHandlers` method:

#### Login Button
- **Before**: Called `window.showLogin?.()`
- **After**: Redirects to `/signin`

#### Register Button
- **Before**: Called `window.showRegister?.()`
- **After**: Redirects to `/signup`

```javascript
const handlers = {
    'navbar-login-btn': (e) => {
        e.preventDefault();
        if (window.authManager?.isAuthenticated()) {
            this.showUserMenu();
        } else {
            window.location.href = '/signin';  // ← CHANGED
        }
    },
    'heroRegisterBtn': (e) => {
        e.preventDefault();
        const isAuth = window.authManager?.isAuthenticated();
        if (isAuth) {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/signup';  // ← CHANGED
        }
    },
    // ...
};
```

#### showAuthModal Method
- **Before**: Showed modal using `window.GlobalAuthModal.show()` or fallback functions
- **After**: Redirects to appropriate auth page

```javascript
showAuthModal(mode = 'login') {
    // Redirect to standalone auth pages instead of showing modal
    if (mode === 'login') {
        window.location.href = '/signin';
    } else if (mode === 'register') {
        window.location.href = '/signup';
    } else {
        console.error('Unknown auth mode:', mode);
    }
}
```

### 3. **pages/shared/auth.js**
Updated `updateUI` method for generic login buttons:
- **Before**: `btn.onclick = () => showLogin()`
- **After**: `btn.onclick = () => window.location.href = '/signin'`

```javascript
document.querySelectorAll('[data-auth="login-btn"]:not(#navbar-login-btn)').forEach(btn => {
    if (this.isAuthenticated()) {
        // ... show user name and link to dashboard
    } else {
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        btn.onclick = () => window.location.href = '/signin';  // ← CHANGED
    }
});
```

## User Flow

### Before
1. User clicks "Login" button
2. Modal appears on current page
3. User fills form in modal
4. Modal closes, stays on same page

### After
1. User clicks "Login" button
2. Redirects to `/signin` page
3. User fills form on dedicated page
4. After login, redirects to `/dashboard`

## Benefits
- ✅ Cleaner user experience with dedicated auth pages
- ✅ Better mobile experience (no modal overlay issues)
- ✅ Easier to bookmark/share auth pages
- ✅ Better SEO (dedicated URLs for signin/signup)
- ✅ Consistent with modern web app patterns
- ✅ Easier to maintain (single source of truth for auth UI)

## Testing
Visit any page and click:
- **Navbar "Login" button** → Should redirect to `/signin`
- **Home page "Get Started" button** → Should redirect to `/signup`
- **Any `[data-auth="login-btn"]` button** → Should redirect to `/signin`

## Notes
- The auth modal system (`window.authModal`, `window.showLogin`, `window.showRegister`) is still loaded but no longer used
- Can be removed in future cleanup if not needed elsewhere
- Logout functionality remains unchanged (handled by `authManager.logout()`)
