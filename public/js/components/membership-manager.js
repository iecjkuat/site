// JKUAT Innovation Club - Membership Management System

class MembershipManager {
    constructor() {
        this.membershipFee = 500; // KSh 500 registration fee
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkMembershipStatus();
    }

    bindEvents() {
        // Membership payment button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'payMembershipBtn' || e.target.closest('#payMembershipBtn')) {
                e.preventDefault();
                this.initiateMembershipPayment();
            }
        });

        // Generate membership card button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'generateCardBtn' || e.target.closest('#generateCardBtn')) {
                e.preventDefault();
                this.generateMembershipCard();
            }
        });
    }

    async checkMembershipStatus() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch('/api/membership/status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateMembershipUI(data);
            }
        } catch (error) {
            console.error('Error checking membership status:', error);
        }
    }

    updateMembershipUI(membershipData) {
        const { status, paymentStatus, membershipCard, expiryDate } = membershipData;

        // Update membership status indicators
        const statusElements = document.querySelectorAll('.membership-status');
        statusElements.forEach(element => {
            element.textContent = this.getStatusLabel(status);
            element.className = `membership-status status-${status.toLowerCase()}`;
        });

        // Show/hide payment button
        const paymentBtn = document.getElementById('payMembershipBtn');
        if (paymentBtn) {
            if (status === 'pending' && paymentStatus !== 'completed') {
                paymentBtn.style.display = 'block';
            } else {
                paymentBtn.style.display = 'none';
            }
        }

        // Show/hide membership card button
        const cardBtn = document.getElementById('generateCardBtn');
        if (cardBtn) {
            if (status === 'active' && membershipCard) {
                cardBtn.style.display = 'block';
            } else {
                cardBtn.style.display = 'none';
            }
        }

        // Update expiry date
        const expiryElements = document.querySelectorAll('.membership-expiry');
        expiryElements.forEach(element => {
            if (expiryDate) {
                element.textContent = new Date(expiryDate).toLocaleDateString();
            }
        });
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'Pending Payment',
            'active': 'Active Member',
            'inactive': 'Inactive',
            'suspended': 'Suspended',
            'expired': 'Expired'
        };
        return labels[status] || status;
    }

    async initiateMembershipPayment() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Please login to continue');
                return;
            }

            // Redirect to payment page with membership parameters
            const paymentUrl = `/payment?type=membership&amount=${this.membershipFee}&description=Club Membership Fee`;
            window.location.href = paymentUrl;

        } catch (error) {
            console.error('Error initiating membership payment:', error);
            alert('Failed to initiate payment. Please try again.');
        }
    }

    async generateMembershipCard() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Please login to continue');
                return;
            }

            const response = await fetch('/api/membership/card/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'JKUAT-Innovation-Club-Membership-Card.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                alert('Membership card downloaded successfully!');
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to generate membership card');
            }
        } catch (error) {
            console.error('Error generating membership card:', error);
            alert('Failed to generate membership card. Please try again.');
        }
    }

    async renewMembership() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Please login to continue');
                return;
            }

            const response = await fetch('/api/membership/renew', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                alert('Membership renewal initiated. Please complete payment.');
                
                // Redirect to payment page
                const paymentUrl = `/payment?type=renewal&amount=${this.membershipFee}&description=Membership Renewal`;
                window.location.href = paymentUrl;
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to initiate renewal');
            }
        } catch (error) {
            console.error('Error renewing membership:', error);
            alert('Failed to initiate renewal. Please try again.');
        }
    }
}

// Member Directory functionality
class MemberDirectory {
    constructor() {
        this.members = [];
        this.filteredMembers = [];
        this.currentPage = 1;
        this.membersPerPage = 12;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMembers();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('memberSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMembers(e.target.value);
            });
        }

        // Filter functionality
        const filterSelects = document.querySelectorAll('.member-filter');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.filterMembers();
            });
        });

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            }
        });
    }

    async loadMembers() {
        try {
            const response = await fetch('/api/membership/directory');
            if (response.ok) {
                const data = await response.json();
                this.members = data.members;
                this.filteredMembers = [...this.members];
                this.renderMembers();
                this.renderPagination();
            }
        } catch (error) {
            console.error('Error loading members:', error);
        }
    }

    searchMembers(query) {
        if (!query.trim()) {
            this.filteredMembers = [...this.members];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredMembers = this.members.filter(member => 
                member.name.toLowerCase().includes(searchTerm) ||
                member.course.toLowerCase().includes(searchTerm) ||
                member.registration_number.toLowerCase().includes(searchTerm)
            );
        }
        this.currentPage = 1;
        this.renderMembers();
        this.renderPagination();
    }

    filterMembers() {
        const courseFilter = document.getElementById('courseFilter')?.value;
        const yearFilter = document.getElementById('yearFilter')?.value;
        const collegeFilter = document.getElementById('collegeFilter')?.value;

        this.filteredMembers = this.members.filter(member => {
            return (!courseFilter || member.course.includes(courseFilter)) &&
                   (!yearFilter || member.year_of_study.toString() === yearFilter) &&
                   (!collegeFilter || member.college.includes(collegeFilter));
        });

        this.currentPage = 1;
        this.renderMembers();
        this.renderPagination();
    }

    renderMembers() {
        const container = document.getElementById('membersContainer');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.membersPerPage;
        const endIndex = startIndex + this.membersPerPage;
        const membersToShow = this.filteredMembers.slice(startIndex, endIndex);

        if (membersToShow.length === 0) {
            container.innerHTML = `
                <div class="glass-card" style="padding: 3rem; text-align: center; grid-column: 1 / -1;">
                    <i class="fas fa-users" style="font-size: 3rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 1rem;"></i>
                    <h3 style="color: white; margin-bottom: 0.5rem;">No members found</h3>
                    <p style="color: rgba(255, 255, 255, 0.7);">Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }

        const membersHTML = membersToShow.map(member => `
            <div class="glass-card member-card" style="padding: 1.5rem; text-align: center; transition: transform 0.3s ease;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">
                    <span style="font-size: 1.5rem; font-weight: 800; color: white;">
                        ${this.getInitials(member.name)}
                    </span>
                </div>
                <h3 style="color: white; font-weight: 600; margin-bottom: 0.5rem; font-size: 1.125rem;">${member.name}</h3>
                <p style="color: #10b981; font-weight: 600; font-size: 0.875rem; margin-bottom: 0.5rem;">${member.registration_number}</p>
                <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; margin-bottom: 0.25rem;">${member.course}</p>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-bottom: 1rem;">Year ${member.year_of_study} • ${member.college}</p>
                
                <div style="display: flex; justify-content: center; gap: 0.5rem;">
                    ${member.linkedin_url ? `
                        <a href="${member.linkedin_url}" target="_blank" style="color: #0077b5; font-size: 1.25rem; transition: color 0.3s;">
                            <i class="fab fa-linkedin"></i>
                        </a>
                    ` : ''}
                    <button onclick="sendMessage('${member.id}')" style="color: #10b981; background: none; border: none; font-size: 1.25rem; cursor: pointer; transition: color 0.3s;">
                        <i class="fas fa-envelope"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = membersHTML;
    }

    renderPagination() {
        const container = document.getElementById('paginationContainer');
        if (!container) return;

        const totalPages = Math.ceil(this.filteredMembers.length / this.membersPerPage);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="${this.currentPage - 1}" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; margin: 0 0.25rem;">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="page-btn active" data-page="${i}" style="background: #10b981; border: 1px solid #10b981; color: white; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; margin: 0 0.25rem;">${i}</button>`;
            } else {
                paginationHTML += `<button class="page-btn" data-page="${i}" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; margin: 0 0.25rem;">${i}</button>`;
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" data-page="${this.currentPage + 1}" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; margin: 0 0.25rem;">Next</button>`;
        }

        container.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderMembers();
        this.renderPagination();
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
}

// Global functions
window.sendMessage = function(memberId) {
    // Redirect to messages page with recipient
    window.location.href = `/messages?recipient=${memberId}`;
};

// Initialize membership manager
document.addEventListener('DOMContentLoaded', () => {
    window.membershipManager = new MembershipManager();
    
    // Initialize member directory if on clubs page
    if (document.getElementById('membersContainer')) {
        window.memberDirectory = new MemberDirectory();
    }
});

// Make classes available globally
window.MembershipManager = MembershipManager;
window.MemberDirectory = MemberDirectory;