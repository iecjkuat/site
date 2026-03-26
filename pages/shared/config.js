/**
 * Application Configuration
 * Centralized configuration for the JKUAT Innovation Club platform
 */

// Supabase Configuration
// In production, these should come from environment variables
const SUPABASE_CONFIG = {
    url: window.ENV?.SUPABASE_URL || 'https://gakuuxwhlczhlgngcdrv.supabase.co',
    anonKey: window.ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha3V1eHdobGN6aGxnbmdjZHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzUyODksImV4cCI6MjA4MTY1MTI4OX0.wbgJik7A6qasB8FMEWZqZka8CEpZyUrSw-Ma2oLZZwM'
};

// API Configuration
const API_CONFIG = {
    baseUrl: window.ENV?.API_BASE_URL || '',
    version: 'v1',
    timeout: 30000 // 30 seconds
};

// Database Table Names (standardized)
const TABLE_NAMES = {
    users: 'users',
    events: 'events',
    projects: 'projects',
    ideas: 'ideas',
    notifications: 'notifications',
    notification_campaigns: 'notification_campaigns',
    notification_templates: 'notification_templates',
    news_articles: 'news_articles',
    opportunities: 'opportunities',
    resources: 'resources',
    payments: 'payments',
    audit_logs: 'audit_logs'
};

// Column Names (standardized)
const COLUMN_NAMES = {
    users: {
        id: 'id',
        email: 'email',
        name: 'name', // Primary name field
        full_name: 'full_name', // Fallback
        role: 'role',
        email_verified: 'email_verified',
        created_at: 'created_at',
        updated_at: 'updated_at',
        last_login: 'last_login' // May not exist in all schemas
    }
};

// Feature Flags
const FEATURES = {
    enableNotifications: true,
    enablePayments: true,
    enableProjects: true,
    enableIdeas: true,
    enableEvents: true,
    enableResources: true
};

// Export configuration
window.APP_CONFIG = {
    supabase: SUPABASE_CONFIG,
    api: API_CONFIG,
    tables: TABLE_NAMES,
    columns: COLUMN_NAMES,
    features: FEATURES
};

console.log('✅ Application configuration loaded');
