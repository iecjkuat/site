// Leadership Page Initialization
// This file handles the initialization of the leadership page

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing leadership page...');
    console.log('Available globals:', {
        jkuatApp: !!window.jkuatApp,
        mockData: !!window.MOCK_LEADERSHIP_DATA,
        LeadershipPage: !!window.LeadershipPage
    });

    // Check if required elements exist
    const requiredElements = ['executiveGrid', 'patronsGrid', 'executiveCount', 'patronCount', 'totalLeadership'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
    } else {
        console.log('All required elements found');
    }

    // Initialize navigation
    if (window.Navigation) {
        try {
            window.navigation = new Navigation();
            console.log('Navigation initialized');
        } catch (error) {
            console.error('Navigation initialization failed:', error);
        }
    } else {
        console.warn('Navigation class not found');
    }

    // Initialize leadership page
    if (window.LeadershipPage) {
        try {
            window.leadershipPageInstance = new LeadershipPage();
            console.log('Leadership page initialized');
        } catch (error) {
            console.error('LeadershipPage initialization failed:', error);
        }
    } else {
        console.error('LeadershipPage class not found');
    }
});