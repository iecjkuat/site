/**
 * Shared navbar initialiser — included by every page.
 * Fetches navbar.html, injects it, and wires up the mobile toggle
 * and active link highlight.
 */
(function () {
    fetch('/shared/navbar.html')
        .then(r => r.text())
        .then(html => {
            const el = document.getElementById('navbar');
            if (!el) return;
            el.innerHTML = html;

            // Active link highlight
            const currentPath = window.location.pathname;
            el.querySelectorAll('.nav-link').forEach(link => {
                if (link.getAttribute('href') === currentPath) {
                    link.style.color = '#10b981';
                }
            });

            // Mobile toggle
            const toggle = el.querySelector('#navToggle');
            const links  = el.querySelector('#navLinks');
            if (toggle && links) {
                toggle.addEventListener('click', () => links.classList.toggle('active'));
            }
        })
        .catch(() => {}); // fail silently — page still works without navbar
}());
