function initNavbar() {
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // Active link highlight
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.style.color = '#10b981';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.navbar')) initNavbar();
});

window.initNavbar = initNavbar;
