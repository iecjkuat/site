'use strict';

// Vercel serverless health check — used by uptime monitors and load balancers.
// Intentionally minimal: no version info, no stack details, nothing useful to an attacker.
module.exports = (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    res.status(200).json({
        status:    'ok',
        timestamp: new Date().toISOString(),
    });
};
