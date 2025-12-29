// Dashboard specific JavaScript
let currentSection = 'dashboard';
let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Load user data and dashboard content
    loadUserData();
    loadDashboardData();
    loadNotifications();
    
    // Set up periodic updates
    setInterval(loadNotifications, 30000); // Update notifications every 30 seconds
});

// Load user data
async function loadUserData() {
    try {
        const response = await apiCall('/api/members/profile');
        currentUser = response;
        
        // Update UI with user data
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('membershipStatus').textContent = currentUser.membershipStatus;
        
        if (currentUser.profilePhoto) {
            document.getElementById('userAvatar').src = currentUser.profilePhoto;
        }
        
        // Update membership status color
        const statusElement = document.getElementById('membershipStatus');
        switch (currentUser.membershipStatus) {
            case 'Active':
                statusElement.className = 'text-lg font-bold text-green-600';
                break;
            case 'Pending':
                statusElement.className = 'text-lg font-bold text-yellow-600';
                break;
            case 'Expired':
                statusElement.className = 'text-lg font-bold text-red-600';
                break;
            default:
                statusElement.className = 'text-lg font-bold text-gray-600';
        }
        
        // Show admin section if user is admin or executive
        if (['Admin', 'Executive'].includes(currentUser.role)) {
            document.getElementById('adminSection').classList.remove('hidden');
        }
        
        // Load message count
        loadMessageCount();
        }
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error loading user data', 'error');
    }
}

// Load dashboard statistics and content
async function loadDashboardData() {
    try {
        // Load upcoming events count
        const eventsResponse = await apiCall('/api/events?upcoming=true&limit=5');
        document.getElementById('upcomingEventsCount').textContent = eventsResponse.total || 0;
        displayRecentEvents(eventsResponse.events || []);
        
        // Load user's ideas count
        const ideasResponse = await apiCall('/api/ideas/user/my-ideas');
        document.getElementById('myIdeasCount').textContent = ideasResponse.length || 0;
        
        // Load recent ideas
        const recentIdeasResponse = await apiCall('/api/ideas?limit=5');
        displayRecentIdeas(recentIdeasResponse.ideas || []);
        
        // Load total members count (if user has access)
        try {
            const membersResponse = await apiCall('/api/members/directory?limit=1');
            document.getElementById('totalMembersCount').textContent = membersResponse.total || 0;
        } catch (error) {
            // User might not have access to member count
            document.getElementById('totalMembersCount').textContent = 'N/A';
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

// Display recent events
function displayRecentEvents(events) {
    const container = document.getElementById('recentEvents');
    
    if (events.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No upcoming events</p>';
        return;
    }
    
    container.innerHTML = events.map(event => `
        <div class="border-b last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0">
            <h3 class="font-semibold text-gray-800">${event.title}</h3>
            <p class="text-sm text-gray-600 mt-1">${truncateText(event.description, 100)}</p>
            <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-blue-600">${formatDate(event.startDate)}</span>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${event.category}</span>
            </div>
        </div>
    `).join('');
}

// Display recent ideas
function displayRecentIdeas(ideas) {
    const container = document.getElementById('recentIdeas');
    
    if (ideas.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No recent ideas</p>';
        return;
    }
    
    container.innerHTML = ideas.map(idea => `
        <div class="border-b last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0">
            <h3 class="font-semibold text-gray-800">${idea.title}</h3>
            <p class="text-sm text-gray-600 mt-1">${truncateText(idea.description, 100)}</p>
            <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-500">by ${idea.submittedBy.name}</span>
                <div class="flex items-center space-x-2">
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">${idea.category}</span>
                    <span class="text-xs text-gray-500">
                        <i class="fas fa-heart text-red-500"></i> ${idea.likes.length}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await apiCall('/api/notifications?limit=10');
        const notifications = response.notifications || [];
        const unreadCount = response.unreadCount || 0;
        
        // Update notification badge
        const badge = document.getElementById('notificationBadge');
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
        
        // Update notifications list
        displayNotifications(notifications);
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Display notifications
function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500">No notifications</div>';
        return;
    }
    
    container.innerHTML = notifications.map(notification => `
        <div class="p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}" 
             onclick="markAsRead('${notification._id}')">
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <i class="fas ${getNotificationIcon(notification.type)} text-${getNotificationColor(notification.type)}-600"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                    <p class="text-sm text-gray-600">${truncateText(notification.message, 80)}</p>
                    <p class="text-xs text-gray-400 mt-1">${formatDate(notification.createdAt)}</p>
                </div>
                ${!notification.isRead ? '<div class="w-2 h-2 bg-blue-600 rounded-full"></div>' : ''}
            </div>
        </div>
    `).join('');
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        announcement: 'fa-bullhorn',
        event: 'fa-calendar',
        payment: 'fa-credit-card',
        system: 'fa-cog',
        reminder: 'fa-bell',
        collaboration: 'fa-handshake',
        like: 'fa-heart',
        comment: 'fa-comment'
    };
    return icons[type] || 'fa-info-circle';
}

// Get notification color based on type
function getNotificationColor(type) {
    const colors = {
        announcement: 'blue',
        event: 'green',
        payment: 'yellow',
        system: 'gray',
        reminder: 'purple',
        collaboration: 'indigo',
        like: 'red',
        comment: 'blue'
    };
    return colors[type] || 'gray';
}

// Mark notification as read
async function markAsRead(notificationId) {
    try {
        await apiCall(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
        loadNotifications(); // Refresh notifications
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Mark all notifications as read
async function markAllAsRead() {
    try {
        await apiCall('/api/notifications/read-all', { method: 'PUT' });
        loadNotifications(); // Refresh notifications
        showNotification('All notifications marked as read', 'success');
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showNotification('Error marking notifications as read', 'error');
    }
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    const sections = ['dashboard', 'profile', 'events', 'ideas', 'members', 'payments', 'leadership'];
    sections.forEach(section => {
        document.getElementById(`${section}Section`).classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}Section`).classList.remove('hidden');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-blue-50', 'text-blue-600');
        link.classList.add('text-gray-700');
    });
    
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('bg-blue-50', 'text-blue-600');
        activeLink.classList.remove('text-gray-700');
    }
    
    currentSection = sectionName;
    
    // Load section-specific content
    loadSectionContent(sectionName);
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        toggleSidebar();
    }
}

// Load content for specific sections
function loadSectionContent(sectionName) {
    switch (sectionName) {
        case 'profile':
            loadProfileContent();
            break;
        case 'events':
            loadEventsContent();
            break;
        case 'ideas':
            loadIdeasContent();
            break;
        case 'members':
            loadMembersContent();
            break;
        case 'payments':
            loadPaymentsContent();
            break;
        case 'leadership':
            loadLeadershipContent();
            break;
    }
}

// Load content for specific sections
function loadProfileContent() {
    if (currentUser) {
        // Populate profile form with user data
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileCourse').textContent = currentUser.course;
        document.getElementById('profileYear').textContent = `Year ${currentUser.yearOfStudy}`;
        
        // Populate edit form
        document.getElementById('editName').value = currentUser.name || '';
        document.getElementById('editEmail').value = currentUser.email || '';
        document.getElementById('editPhone').value = currentUser.phone || '';
        document.getElementById('editRegNumber').value = currentUser.registrationNumber || '';
        document.getElementById('editBio').value = currentUser.bio || '';
        document.getElementById('editSkills').value = currentUser.skills ? currentUser.skills.join(', ') : '';
    }
}

function loadEventsContent() {
    // Load events from API
    loadEvents();
}

function loadIdeasContent() {
    // Load ideas from API
    loadIdeas();
}

function loadMembersContent() {
    // Load members directory
    loadMembers();
}

function loadPaymentsContent() {
    // Load payment history
    loadPaymentHistory();
}

function loadLeadershipContent() {
    // Leadership content is static, no additional loading needed
    console.log('Leadership content loaded');
}

// API functions for loading data
async function loadEvents() {
    try {
        const response = await apiCall('/api/events?upcoming=true');
        // Events are already displayed as static content for demo
        console.log('Events loaded:', response);
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

async function loadIdeas() {
    try {
        const response = await apiCall('/api/ideas');
        // Ideas are already displayed as static content for demo
        console.log('Ideas loaded:', response);
    } catch (error) {
        console.error('Error loading ideas:', error);
    }
}

async function loadMembers() {
    try {
        const response = await apiCall('/api/members/directory');
        // Members are already displayed as static content for demo
        console.log('Members loaded:', response);
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

async function loadPaymentHistory() {
    try {
        const response = await apiCall('/api/payments/history');
        // Payment history is already displayed as static content for demo
        console.log('Payment history loaded:', response);
    } catch (error) {
        console.error('Error loading payment history:', error);
    }
}

// Modal functions for new content
function showCreateEventModal() {
    document.getElementById('createEventModal').classList.remove('hidden');
}

function hideCreateEventModal() {
    document.getElementById('createEventModal').classList.add('hidden');
    document.getElementById('createEventForm').reset();
}

function showSubmitIdeaModal() {
    document.getElementById('submitIdeaModal').classList.remove('hidden');
}

function hideSubmitIdeaModal() {
    document.getElementById('submitIdeaModal').classList.add('hidden');
    document.getElementById('submitIdeaForm').reset();
}

// Handle create event form submission
async function handleCreateEvent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const eventData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        venue: formData.get('venue'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        maxAttendees: formData.get('maxAttendees') ? parseInt(formData.get('maxAttendees')) : null,
        registrationFee: formData.get('registrationFee') ? parseFloat(formData.get('registrationFee')) : 0
    };
    
    try {
        const response = await apiCall('/api/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
        
        showNotification('Event created successfully!', 'success');
        hideCreateEventModal();
        loadEventsContent(); // Refresh events list
    } catch (error) {
        console.error('Create event error:', error);
        showNotification('Error creating event: ' + error.message, 'error');
    }
}

// Handle submit idea form submission
async function handleSubmitIdea(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const ideaData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        developmentStage: formData.get('developmentStage'),
        problemStatement: formData.get('problemStatement'),
        targetAudience: formData.get('targetAudience'),
        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
        isPublic: formData.has('isPublic'),
        seekingCollaboration: formData.has('seekingCollaboration')
    };
    
    try {
        const response = await apiCall('/api/ideas', {
            method: 'POST',
            body: JSON.stringify(ideaData)
        });
        
        showNotification('Idea submitted successfully!', 'success');
        hideSubmitIdeaModal();
        loadIdeasContent(); // Refresh ideas list
    } catch (error) {
        console.error('Submit idea error:', error);
        showNotification('Error submitting idea: ' + error.message, 'error');
    }
}

// Form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('editName').value,
                phone: document.getElementById('editPhone').value,
                bio: document.getElementById('editBio').value,
                skills: document.getElementById('editSkills').value.split(',').map(s => s.trim()).filter(s => s)
            };
            
            try {
                const response = await apiCall('/api/members/profile', {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                
                currentUser = response;
                showNotification('Profile updated successfully!', 'success');
                loadProfileContent(); // Refresh profile display
            } catch (error) {
                console.error('Profile update error:', error);
                showNotification('Error updating profile', 'error');
            }
        });
    }
    
    // Create event form
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', handleCreateEvent);
    }
    
    // Submit idea form
    const submitIdeaForm = document.getElementById('submitIdeaForm');
    if (submitIdeaForm) {
        submitIdeaForm.addEventListener('submit', handleSubmitIdea);
    }
});

// UI interaction functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.toggle('hidden');
    
    // Close user dropdown if open
    document.getElementById('userDropdown').classList.add('hidden');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
    
    // Close notifications dropdown if open
    document.getElementById('notificationsDropdown').classList.add('hidden');
}

function showProfile() {
    showSection('profile');
    toggleUserMenu();
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
    
    if (!notificationsBtn && !notificationsDropdown.contains(e.target)) {
        notificationsDropdown.classList.add('hidden');
    }
    
    if (!userMenuBtn && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
        // Desktop view - ensure sidebar is visible and overlay is hidden
        document.getElementById('sidebar').classList.remove('-translate-x-full');
        document.getElementById('sidebarOverlay').classList.add('hidden');
    }
});

// Load message count for badge
async function loadMessageCount() {
    try {
        const response = await apiCall('/api/messages/stats');
        const unreadCount = response.stats.unreadCount;
        
        const badge = document.getElementById('messagesBadge');
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (error) {
        console.error('Failed to load message count:', error);
    }
}

// Show membership section
function showMembershipSection() {
    const content = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Membership</h2>
                <div class="flex space-x-2">
                    <button onclick="generateMembershipCard()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-id-card mr-2"></i>Generate Card
                    </button>
                    <button onclick="renewMembership()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                        <i class="fas fa-refresh mr-2"></i>Renew
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Membership Status -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-4">Membership Status</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Status:</span>
                            <span id="membershipStatusDetail" class="font-semibold">${currentUser?.membershipStatus || 'Unknown'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Member Number:</span>
                            <span class="font-semibold">${currentUser?.membershipNumber || 'Not assigned'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Registration Date:</span>
                            <span class="font-semibold">${currentUser?.registrationDate ? new Date(currentUser.registrationDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Expiry Date:</span>
                            <span class="font-semibold">${currentUser?.membershipExpiryDate ? new Date(currentUser.membershipExpiryDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Membership Card -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-4">Digital Membership Card</h3>
                    <div id="membershipCardContainer" class="text-center">
                        <div class="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8">
                            <i class="fas fa-id-card fa-3x text-gray-400 mb-4"></i>
                            <p class="text-gray-600">No membership card generated</p>
                            <button onclick="generateMembershipCard()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                Generate Card
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Payment History -->
            <div class="mt-8">
                <h3 class="text-lg font-semibold mb-4">Payment History</h3>
                <div id="paymentHistory" class="bg-gray-50 rounded-lg p-4">
                    <div class="text-center text-gray-600">
                        <i class="fas fa-spinner fa-spin fa-2x mb-4"></i>
                        <p>Loading payment history...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('content').innerHTML = content;
    loadMembershipData();
}

// Load membership data
async function loadMembershipData() {
    try {
        // Load membership status
        const membershipResponse = await apiCall('/api/membership/status');
        const membershipData = membershipResponse.membership;
        
        // Update membership card section
        if (membershipData.hasCard) {
            document.getElementById('membershipCardContainer').innerHTML = `
                <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="text-lg font-bold">JKUAT I&E Club</h4>
                            <p class="text-sm opacity-90">Membership Card</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm opacity-90">Card #</p>
                            <p class="font-bold">${membershipData.cardNumber}</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <p class="text-lg font-bold">${currentUser.name}</p>
                        <p class="text-sm opacity-90">${currentUser.registrationNumber}</p>
                    </div>
                    <div class="flex justify-between items-end">
                        <div>
                            <p class="text-xs opacity-75">Valid Until</p>
                            <p class="font-semibold">${new Date(membershipData.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div class="text-right">
                            <button onclick="downloadMembershipCard()" class="bg-white bg-opacity-20 text-white px-3 py-1 rounded text-sm hover:bg-opacity-30 transition">
                                <i class="fas fa-download mr-1"></i>Download
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Load payment history
        const paymentsResponse = await apiCall('/api/payments/history?limit=5');
        const payments = paymentsResponse.payments;
        
        if (payments.length > 0) {
            const paymentHistoryHtml = `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b">
                                <th class="text-left py-2">Date</th>
                                <th class="text-left py-2">Description</th>
                                <th class="text-left py-2">Amount</th>
                                <th class="text-left py-2">Status</th>
                                <th class="text-left py-2">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.map(payment => `
                                <tr class="border-b">
                                    <td class="py-2">${new Date(payment.createdAt).toLocaleDateString()}</td>
                                    <td class="py-2">${payment.description}</td>
                                    <td class="py-2">KES ${payment.amount.toLocaleString()}</td>
                                    <td class="py-2">
                                        <span class="px-2 py-1 rounded text-xs ${getPaymentStatusClass(payment.status)}">
                                            ${payment.status}
                                        </span>
                                    </td>
                                    <td class="py-2">
                                        ${payment.status === 'Completed' ? 
                                            `<button onclick="downloadReceipt('${payment._id}')" class="text-blue-600 hover:underline">
                                                <i class="fas fa-download mr-1"></i>Download
                                            </button>` : 
                                            '-'
                                        }
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="mt-4 text-center">
                    <a href="/payment" class="text-blue-600 hover:underline">View all payments</a>
                </div>
            `;
            document.getElementById('paymentHistory').innerHTML = paymentHistoryHtml;
        } else {
            document.getElementById('paymentHistory').innerHTML = `
                <div class="text-center text-gray-600">
                    <i class="fas fa-receipt fa-2x mb-4"></i>
                    <p>No payment history found</p>
                    <a href="/payment" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        Make Payment
                    </a>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Failed to load membership data:', error);
        showError('Failed to load membership data');
    }
}

// Generate membership card
async function generateMembershipCard() {
    try {
        const response = await apiCall('/api/membership/card/generate', 'POST');
        showSuccess('Membership card generated successfully!');
        loadMembershipData(); // Reload to show the new card
    } catch (error) {
        console.error('Failed to generate membership card:', error);
        showError('Failed to generate membership card: ' + (error.message || 'Unknown error'));
    }
}

// Renew membership
async function renewMembership() {
    try {
        const response = await apiCall('/api/membership/renew', 'POST');
        showSuccess('Membership renewal initiated. Please complete payment.');
        // Redirect to payment page
        window.location.href = '/payment';
    } catch (error) {
        console.error('Failed to renew membership:', error);
        showError('Failed to renew membership: ' + (error.message || 'Unknown error'));
    }
}

// Download membership card
async function downloadMembershipCard() {
    try {
        const membershipResponse = await apiCall('/api/membership/status');
        const cardId = membershipResponse.membership.cardId;
        
        if (cardId) {
            window.open(`/api/membership/card/${cardId}/pdf`, '_blank');
        } else {
            showError('Membership card not found');
        }
    } catch (error) {
        console.error('Failed to download membership card:', error);
        showError('Failed to download membership card');
    }
}

// Download payment receipt
function downloadReceipt(paymentId) {
    window.open(`/api/payments/receipt/${paymentId}/download`, '_blank');
}

// Get payment status CSS class
function getPaymentStatusClass(status) {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'Processing':
            return 'bg-blue-100 text-blue-800';
        case 'Failed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Update the showSection function to handle membership
const originalShowSection = showSection;
showSection = function(section) {
    if (section === 'membership') {
        showMembershipSection();
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('bg-blue-50', 'text-blue-600');
            link.classList.add('text-gray-700');
        });
        
        const membershipLink = document.querySelector('[onclick="showSection(\'membership\')"]');
        if (membershipLink) {
            membershipLink.classList.remove('text-gray-700');
            membershipLink.classList.add('bg-blue-50', 'text-blue-600');
        }
        
        currentSection = section;
    } else {
        originalShowSection(section);
    }
};