// Database Management JavaScript

let currentPage = 1;
let currentSection = 'overview';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    refreshOverview();
});

// Show different sections
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section).classList.add('active');
    
    // Add active class to clicked nav link
    event.target.classList.add('active');
    
    currentSection = section;
    
    // Load data for the section
    switch(section) {
        case 'overview':
            refreshOverview();
            break;
        case 'users':
            loadUsers();
            break;
        case 'events':
            loadEvents();
            break;
        case 'payments':
            loadPayments();
            break;
    }
}

// Refresh overview data
async function refreshOverview() {
    try {
        // Load database stats
        const statsResponse = await fetch('/api/database/stats');
        const stats = await statsResponse.json();
        
        // Load collections overview
        const overviewResponse = await fetch('/api/database/overview');
        const overview = await overviewResponse.json();
        
        displayStats(stats);
        displayCollections(overview);
        
    } catch (error) {
        console.error('Error loading overview:', error);
        showNotification('Error loading database overview', 'error');
    }
}

// Display statistics cards
function displayStats(stats) {
    const statsCards = document.getElementById('statsCards');
    
    statsCards.innerHTML = `
        <div class="col-md-3 mb-3">
            <div class="card stat-card">
                <div class="card-body text-center">
                    <i class="fas fa-users fa-2x mb-2"></i>
                    <h3>${stats.users.total}</h3>
                    <p class="mb-0">Total Users</p>
                    <small>${stats.users.active} Active</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="card stat-card">
                <div class="card-body text-center">
                    <i class="fas fa-calendar fa-2x mb-2"></i>
                    <h3>${stats.events.total}</h3>
                    <p class="mb-0">Total Events</p>
                    <small>${stats.events.upcoming} Upcoming</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="card stat-card">
                <div class="card-body text-center">
                    <i class="fas fa-credit-card fa-2x mb-2"></i>
                    <h3>${stats.payments.total}</h3>
                    <p class="mb-0">Total Payments</p>
                    <small>${stats.payments.completed} Completed</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="card stat-card">
                <div class="card-body text-center">
                    <i class="fas fa-money-bill fa-2x mb-2"></i>
                    <h3>KES ${stats.revenue.total.toLocaleString()}</h3>
                    <p class="mb-0">Total Revenue</p>
                    <small>From completed payments</small>
                </div>
            </div>
        </div>
    `;
}

// Display collections table
function displayCollections(overview) {
    const collectionsTable = document.getElementById('collectionsTable');
    
    let tableHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <h6><i class="fas fa-server me-2"></i>Database: ${overview.database}</h6>
                <span class="badge bg-success">${overview.status}</span>
            </div>
            <div class="col-md-6 text-end">
                <small class="text-muted">Total Collections: ${overview.collections}</small>
            </div>
        </div>
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Collection Name</th>
                    <th>Document Count</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    overview.details.forEach(collection => {
        tableHTML += `
            <tr>
                <td><i class="fas fa-database me-2"></i>${collection.name}</td>
                <td>${collection.count}</td>
                <td><span class="badge bg-secondary">${collection.type}</span></td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    collectionsTable.innerHTML = tableHTML;
}

// Load users data
async function loadUsers(page = 1) {
    try {
        const response = await fetch(`/api/database/users?page=${page}&limit=10`);
        const data = await response.json();
        
        displayUsers(data.users);
        displayPagination('users', data.pagination);
        
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users', 'error');
    }
}

// Display users table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.registrationNumber}</td>
            <td><span class="badge bg-${getStatusColor(user.membershipStatus)}">${user.membershipStatus}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewUser('${user._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editUser('${user._id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load events data
async function loadEvents(page = 1) {
    try {
        const response = await fetch(`/api/database/events?page=${page}&limit=10`);
        const data = await response.json();
        
        displayEvents(data.events);
        displayPagination('events', data.pagination);
        
    } catch (error) {
        console.error('Error loading events:', error);
        showNotification('Error loading events', 'error');
    }
}

// Display events table
function displayEvents(events) {
    const tbody = document.getElementById('eventsTableBody');
    
    tbody.innerHTML = events.map(event => `
        <tr>
            <td>${event.title}</td>
            <td>${new Date(event.startDate).toLocaleDateString()}</td>
            <td>${event.location || 'N/A'}</td>
            <td>${event.attendees ? event.attendees.length : 0}</td>
            <td><span class="badge bg-${getEventStatusColor(event.status)}">${event.status}</span></td>
            <td>${new Date(event.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Load payments data
async function loadPayments(page = 1) {
    try {
        const response = await fetch(`/api/database/payments?page=${page}&limit=10`);
        const data = await response.json();
        
        displayPayments(data.payments);
        displayPagination('payments', data.pagination);
        
    } catch (error) {
        console.error('Error loading payments:', error);
        showNotification('Error loading payments', 'error');
    }
}

// Display payments table
function displayPayments(payments) {
    const tbody = document.getElementById('paymentsTableBody');
    
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.userId ? payment.userId.name : 'N/A'}</td>
            <td>KES ${payment.amount.toLocaleString()}</td>
            <td><span class="badge bg-info">${payment.method}</span></td>
            <td><span class="badge bg-${getPaymentStatusColor(payment.status)}">${payment.status}</span></td>
            <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
            <td>${payment.transactionId || 'N/A'}</td>
        </tr>
    `).join('');
}

// Display pagination
function displayPagination(section, pagination) {
    const paginationDiv = document.getElementById(`${section}Pagination`);
    
    let paginationHTML = '<nav><ul class="pagination">';
    
    // Previous button
    if (pagination.current > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="load${section.charAt(0).toUpperCase() + section.slice(1)}(${pagination.current - 1})">Previous</a>
            </li>
        `;
    }
    
    // Page numbers
    for (let i = Math.max(1, pagination.current - 2); i <= Math.min(pagination.total, pagination.current + 2); i++) {
        paginationHTML += `
            <li class="page-item ${i === pagination.current ? 'active' : ''}">
                <a class="page-link" href="#" onclick="load${section.charAt(0).toUpperCase() + section.slice(1)}(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    if (pagination.current < pagination.total) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="load${section.charAt(0).toUpperCase() + section.slice(1)}(${pagination.current + 1})">Next</a>
            </li>
        `;
    }
    
    paginationHTML += '</ul></nav>';
    paginationDiv.innerHTML = paginationHTML;
}

// Search users
async function searchUsers() {
    const query = document.getElementById('userSearch').value.trim();
    if (!query) {
        loadUsers();
        return;
    }
    
    try {
        const response = await fetch(`/api/database/users/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        displayUsers(data.users);
        document.getElementById('usersPagination').innerHTML = `<p class="text-muted">Found ${data.count} users</p>`;
        
    } catch (error) {
        console.error('Error searching users:', error);
        showNotification('Error searching users', 'error');
    }
}

// View user details
async function viewUser(userId) {
    try {
        const response = await fetch(`/api/database/users/${userId}`);
        const user = await response.json();
        
        const modalBody = document.getElementById('userModalBody');
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Basic Information</h6>
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone}</p>
                    <p><strong>Registration #:</strong> ${user.registrationNumber}</p>
                </div>
                <div class="col-md-6">
                    <h6>Academic Information</h6>
                    <p><strong>Course:</strong> ${user.course}</p>
                    <p><strong>Year:</strong> ${user.yearOfStudy}</p>
                    <p><strong>College:</strong> ${user.college}</p>
                    <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(user.membershipStatus)}">${user.membershipStatus}</span></p>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-md-6">
                    <h6>Account Status</h6>
                    <p><strong>Email Verified:</strong> ${user.isEmailVerified ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Last Login:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Timestamps</h6>
                    <p><strong>Created:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
                    <p><strong>Updated:</strong> ${new Date(user.updatedAt).toLocaleString()}</p>
                </div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading user details:', error);
        showNotification('Error loading user details', 'error');
    }
}

// Execute custom query
async function executeQuery() {
    const collection = document.getElementById('queryCollection').value;
    const operation = document.getElementById('queryOperation').value;
    const queryInput = document.getElementById('queryInput').value.trim();
    
    let query = {};
    if (queryInput) {
        try {
            query = JSON.parse(queryInput);
        } catch (error) {
            showNotification('Invalid JSON query', 'error');
            return;
        }
    }
    
    try {
        const response = await fetch('/api/database/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                collection,
                operation,
                query
            })
        });
        
        const data = await response.json();
        
        document.getElementById('queryResults').innerHTML = JSON.stringify(data, null, 2);
        
    } catch (error) {
        console.error('Error executing query:', error);
        showNotification('Error executing query', 'error');
    }
}

// Helper functions
function getStatusColor(status) {
    switch(status) {
        case 'Active': return 'success';
        case 'Pending': return 'warning';
        case 'Expired': return 'secondary';
        case 'Suspended': return 'danger';
        default: return 'secondary';
    }
}

function getEventStatusColor(status) {
    switch(status) {
        case 'upcoming': return 'primary';
        case 'ongoing': return 'success';
        case 'completed': return 'secondary';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

function getPaymentStatusColor(status) {
    switch(status) {
        case 'completed': return 'success';
        case 'pending': return 'warning';
        case 'failed': return 'danger';
        default: return 'secondary';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Handle search on Enter key
document.getElementById('userSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchUsers();
    }
});