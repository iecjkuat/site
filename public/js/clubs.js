// Clubs Platform JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadClubs();
    loadStatistics();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Club registration form
    const clubForm = document.getElementById('clubRegistrationForm');
    if (clubForm) {
        clubForm.addEventListener('submit', handleClubRegistration);
    }
    
    // Search functionality
    const searchInput = document.getElementById('clubSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchClubs();
            }
        });
    }
    
    // Faculty filter
    const facultyFilter = document.getElementById('facultyFilter');
    if (facultyFilter) {
        facultyFilter.addEventListener('change', searchClubs);
    }
}

// Load all clubs
async function loadClubs() {
    try {
        showLoading(true);
        
        const response = await fetch('/api/clubs');
        const clubs = await response.json();
        
        displayClubs(clubs);
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading clubs:', error);
        showNotification('Error loading clubs', 'error');
        showLoading(false);
    }
}

// Load platform statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/clubs');
        const clubs = await response.json();
        
        // Calculate totals
        let totalMembers = 0;
        let totalEvents = 0;
        
        clubs.forEach(club => {
            totalMembers += club.stats.totalMembers || 0;
            totalEvents += club.stats.totalEvents || 0;
        });
        
        // Update display
        document.getElementById('totalClubs').textContent = clubs.length;
        document.getElementById('totalMembers').textContent = totalMembers.toLocaleString();
        document.getElementById('totalEvents').textContent = totalEvents;
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Display clubs in grid
function displayClubs(clubs) {
    const grid = document.getElementById('clubsGrid');
    
    if (clubs.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No clubs found</h3>
                <p class="text-gray-500">Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = clubs.map(club => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden card-hover">
            <div class="h-48 bg-gradient-to-r ${getClubGradient(club.shortName)} flex items-center justify-center">
                <div class="text-center text-white">
                    <h3 class="text-2xl font-bold mb-2">${club.shortName}</h3>
                    <p class="text-sm opacity-90">${club.faculty}</p>
                </div>
            </div>
            
            <div class="p-6">
                <h4 class="text-xl font-semibold mb-2">${club.name}</h4>
                <p class="text-gray-600 mb-4 line-clamp-3">${club.description}</p>
                
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span><i class="fas fa-users mr-1"></i>${club.stats.totalMembers || 0} members</span>
                    <span><i class="fas fa-calendar mr-1"></i>${club.stats.totalEvents || 0} events</span>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <a href="mailto:${club.email}" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-envelope"></i>
                        </a>
                        <a href="tel:${club.phone}" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-phone"></i>
                        </a>
                        ${club.website ? `<a href="${club.website}" target="_blank" class="text-blue-600 hover:text-blue-800"><i class="fas fa-globe"></i></a>` : ''}
                    </div>
                    <button onclick="viewClub('${club._id}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Search clubs
async function searchClubs() {
    try {
        showLoading(true);
        
        const searchTerm = document.getElementById('clubSearch').value.trim();
        const faculty = document.getElementById('facultyFilter').value;
        
        let url = '/api/clubs';
        const params = new URLSearchParams();
        
        if (searchTerm) {
            url = `/api/clubs/search/${encodeURIComponent(searchTerm)}`;
        }
        
        const response = await fetch(url);
        let clubs = await response.json();
        
        // Filter by faculty if selected
        if (faculty) {
            clubs = clubs.filter(club => club.faculty === faculty);
        }
        
        displayClubs(clubs);
        showLoading(false);
        
    } catch (error) {
        console.error('Error searching clubs:', error);
        showNotification('Error searching clubs', 'error');
        showLoading(false);
    }
}

// Handle club registration
async function handleClubRegistration(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('clubName').value,
        shortName: document.getElementById('clubShortName').value,
        description: document.getElementById('clubDescription').value,
        email: document.getElementById('clubEmail').value,
        phone: document.getElementById('clubPhone').value,
        website: document.getElementById('clubWebsite').value,
        faculty: document.getElementById('clubFaculty').value,
        advisor: document.getElementById('clubAdvisor').value,
        advisorEmail: document.getElementById('clubAdvisorEmail').value,
        membershipFee: parseInt(document.getElementById('clubMembershipFee').value) || 0
    };
    
    try {
        const response = await fetch('/api/clubs/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Club registration submitted successfully! Awaiting approval.', 'success');
            document.getElementById('clubRegistrationForm').reset();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (data.errors) {
                const errorMessages = data.errors.map(error => error.msg).join(', ');
                showNotification(errorMessages, 'error');
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// View club details
function viewClub(clubId) {
    // For now, redirect to the club's specific page
    // In the future, this could open a modal or navigate to a detailed page
    window.location.href = `/club/${clubId}`;
}

// Utility functions
function getClubGradient(shortName) {
    const gradients = [
        'from-blue-500 to-purple-600',
        'from-green-500 to-teal-600',
        'from-red-500 to-pink-600',
        'from-yellow-500 to-orange-600',
        'from-indigo-500 to-blue-600',
        'from-purple-500 to-indigo-600',
        'from-pink-500 to-red-600',
        'from-teal-500 to-green-600'
    ];
    
    // Use shortName to consistently assign gradient
    const index = shortName.charCodeAt(0) % gradients.length;
    return gradients[index];
}

function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const clubsGrid = document.getElementById('clubsGrid');
    
    if (show) {
        loadingState.classList.remove('hidden');
        clubsGrid.classList.add('hidden');
    } else {
        loadingState.classList.add('hidden');
        clubsGrid.classList.remove('hidden');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Scroll functions
function scrollToClubs() {
    document.getElementById('clubs-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function scrollToRegister() {
    document.getElementById('register-club').scrollIntoView({ 
        behavior: 'smooth' 
    });
}