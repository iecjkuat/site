// Unified Navigation Bar Component
function createUnifiedNavbar(currentPage = 'home') {
    const isLoggedIn = localStorage.getItem('token') !== null;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    return `
    <nav class="bg-white shadow-lg fixed w-full z-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <!-- Logo and Brand -->
                <div class="flex items-center space-x-4">
                    ${currentPage === 'dashboard' ? '<button onclick="toggleSidebar()" class="lg:hidden text-gray-600"><i class="fas fa-bars text-xl"></i></button>' : ''}
                    <a href="/" class="flex items-center space-x-4">
                        <img src="/images/logo.png" alt="JKUAT Innovation and Entrepreneurship Club" class="h-10 w-10">
                        <span class="text-xl font-bold text-gray-800">JKUAT Innovation and Entrepreneurship Club</span>
                    </a>
                </div>
                
                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center space-x-6">
                    <a href="/" class="text-gray-600 hover:text-blue-600 transition ${currentPage === 'home' ? 'text-blue-600 font-semibold' : ''}">
                        <i class="fas fa-home mr-1"></i>Home
                    </a>
                    <a href="/events" class="text-gray-600 hover:text-blue-600 transition ${currentPage === 'events' ? 'text-blue-600 font-semibold' : ''}">
                        <i class="fas fa-calendar mr-1"></i>Events
                    </a>
                    ${isLoggedIn ? `
                        <a href="/dashboard" class="text-gray-600 hover:text-blue-600 transition ${currentPage === 'dashboard' ? 'text-blue-600 font-semibold' : ''}">
                            <i class="fas fa-tachometer-alt mr-1"></i>Dashboard
                        </a>
                    ` : ''}
                    
                    ${!isLoggedIn ? `
                        <button onclick="showLoginModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-sign-in-alt mr-1"></i>Login
                        </button>
                        <button onclick="showRegisterModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                            <i class="fas fa-user-plus mr-1"></i>Join Us
                        </button>
                    ` : `
                        <!-- Notifications -->
                        <div class="relative">
                            <button onclick="toggleNotifications()" class="text-gray-600 hover:text-blue-600 relative">
                                <i class="fas fa-bell text-xl"></i>
                                <span id="notificationBadge" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center hidden">0</span>
                            </button>
                            
                            <!-- Notifications Dropdown -->
                            <div id="notificationsDropdown" class="hidden absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                                <div class="p-4 border-b">
                                    <h3 class="font-semibold">Notifications</h3>
                                </div>
                                <div id="notificationsList" class="max-h-64 overflow-y-auto">
                                    <div class="p-4 text-center text-gray-500">No notifications</div>
                                </div>
                                <div class="p-2 border-t">
                                    <button onclick="markAllAsRead()" class="text-blue-600 text-sm hover:underline">Mark all as read</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- User Menu -->
                        <div class="relative">
                            <button onclick="toggleUserMenu()" class="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                                <img id="userAvatar" src="/images/default-avatar.png" alt="User" class="h-8 w-8 rounded-full">
                                <span id="userName">${currentUser.name || 'User'}</span>
                                <i class="fas fa-chevron-down text-sm"></i>
                            </button>
                            
                            <!-- User Dropdown -->
                            <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                                <a href="/dashboard" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    <i class="fas fa-user mr-2"></i>Profile
                                </a>
                                <a href="#" onclick="showSettings()" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    <i class="fas fa-cog mr-2"></i>Settings
                                </a>
                                <div class="border-t"></div>
                                <button onclick="logout()" class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                </button>
                            </div>
                        </div>
                    `}
                </div>
                
                <!-- Mobile Menu Button -->
                <div class="md:hidden">
                    <button onclick="toggleMobileMenu()" class="text-gray-600">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobileMenu" class="hidden md:hidden bg-white border-t">
            <div class="px-4 py-2 space-y-2">
                <a href="/" class="block py-2 text-gray-600 hover:text-blue-600 ${currentPage === 'home' ? 'text-blue-600 font-semibold' : ''}">
                    <i class="fas fa-home mr-2"></i>Home
                </a>
                <a href="/events" class="block py-2 text-gray-600 hover:text-blue-600 ${currentPage === 'events' ? 'text-blue-600 font-semibold' : ''}">
                    <i class="fas fa-calendar mr-2"></i>Events
                </a>
                ${isLoggedIn ? `
                    <a href="/dashboard" class="block py-2 text-gray-600 hover:text-blue-600 ${currentPage === 'dashboard' ? 'text-blue-600 font-semibold' : ''}">
                        <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                    </a>
                    <button onclick="logout(); toggleMobileMenu();" class="w-full text-left py-2 text-red-600">
                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                ` : `
                    <button onclick="showLoginModal(); toggleMobileMenu();" class="w-full text-left py-2 text-blue-600">
                        <i class="fas fa-sign-in-alt mr-2"></i>Login
                    </button>
                    <button onclick="showRegisterModal(); toggleMobileMenu();" class="w-full text-left py-2 text-green-600">
                        <i class="fas fa-user-plus mr-2"></i>Join Us
                    </button>
                `}
            </div>
        </div>
    </nav>
    `;
}

// Initialize navbar on page load
function initializeNavbar(currentPage = 'home') {
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = createUnifiedNavbar(currentPage);
    }
    
    // Update user info if logged in
    const token = localStorage.getItem('token');
    if (token) {
        updateNavbarUserInfo();
    }
}

// Update navbar user information
function updateNavbarUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userNameElement = document.getElementById('userName');
    const userAvatarElement = document.getElementById('userAvatar');
    
    if (userNameElement && currentUser.name) {
        userNameElement.textContent = currentUser.name;
    }
    
    if (userAvatarElement && currentUser.profilePhoto) {
        userAvatarElement.src = currentUser.profilePhoto;
    }
}

// Navbar interaction functions
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        document.getElementById('userDropdown')?.classList.add('hidden');
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        document.getElementById('notificationsDropdown')?.classList.add('hidden');
    }
}

function showSettings() {
    window.location.href = '/settings';
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    const notificationsBtn = e.target.closest('[onclick="toggleNotifications()"]');
    const userMenuBtn = e.target.closest('[onclick="toggleUserMenu()"]');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const userDropdown = document.getElementById('userDropdown');
    
    if (!notificationsBtn && notificationsDropdown && !notificationsDropdown.contains(e.target)) {
        notificationsDropdown.classList.add('hidden');
    }
    
    if (!userMenuBtn && userDropdown && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});