/**
 * JKUAT Innovation Club - Media Storage Configuration
 * Configure different storage providers for event media
 */

// Media Storage Configuration
window.MEDIA_CONFIG = {
    // Default storage type (will be auto-detected if not set)
    defaultStorage: 'local', // 'local', 'cloudinary', 'supabase', 'aws'
    
    // File size limits (in bytes)
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImageSize: 5 * 1024 * 1024,  // 5MB for images
    maxVideoSize: 50 * 1024 * 1024, // 50MB for videos
    
    // Allowed file types
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    
    // Image optimization settings
    imageOptimization: {
        quality: 80,
        maxWidth: 1920,
        maxHeight: 1080,
        thumbnailSize: 300
    },
    
    // Video settings
    videoSettings: {
        maxDuration: 300, // 5 minutes in seconds
        thumbnailTime: 1   // Generate thumbnail at 1 second
    }
};

// Cloudinary Configuration (Free tier: 25GB storage, 25GB bandwidth/month)
window.CLOUDINARY_CONFIG = {
    cloudName: 'your-cloud-name',        // Replace with your Cloudinary cloud name
    uploadPreset: 'jkuat-events',        // Replace with your upload preset
    apiKey: 'your-api-key',              // Replace with your API key
    folder: 'jkuat-innovation-club/events',
    
    // Transformation presets
    transformations: {
        thumbnail: 'w_300,h_300,c_fill,q_80,f_auto',
        medium: 'w_800,h_600,c_fill,q_80,f_auto',
        large: 'w_1200,h_900,c_fill,q_80,f_auto'
    }
};

// Supabase Configuration (Free tier: 1GB storage, 2GB bandwidth/month)
window.SUPABASE_CONFIG = {
    // SETUP INSTRUCTIONS:
    // 1. Go to https://supabase.com and create a new project
    // 2. Go to Settings > API to get your URL and anon key
    // 3. Replace the values below with your actual project details
    // 4. Create a storage bucket named 'event-media' in Storage section
    // 5. Set up RLS policies (see policies array below)
    
    url: 'https://gakuuxwhlczhlgngcdrv.supabase.co',   // Replace with your Supabase project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha3V1eHdobGN6aGxnbmdjZHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzUyODksImV4cCI6MjA4MTY1MTI4OX0.wbgJik7A6qasB8FMEWZqZka8CEpZyUrSw-Ma2oLZZwM',                // Replace with your anon key
    bucket: 'event-media',                        // Storage bucket name
    
    // File organization
    folders: {
        images: 'events/images',
        videos: 'events/videos',
        thumbnails: 'events/thumbnails'
    },
    
    // RLS (Row Level Security) policies needed:
    // Run these SQL commands in your Supabase SQL editor:
    policies: [
        `-- Enable RLS on storage.objects
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        
        -- Allow public read access to event media
        CREATE POLICY "Public read access for event media" ON storage.objects
        FOR SELECT USING (bucket_id = 'event-media');
        
        -- Allow authenticated users to upload to events folder
        CREATE POLICY "Authenticated users can upload event media" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'event-media' 
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[1] = 'events'
        );
        
        -- Allow users to delete their own uploads (optional)
        CREATE POLICY "Users can delete their own uploads" ON storage.objects
        FOR DELETE USING (
            bucket_id = 'event-media' 
            AND auth.uid()::text = (metadata->>'uploadedBy')
        );`
    ],
    
    // Storage bucket configuration (run in Supabase dashboard)
    bucketSetup: {
        name: 'event-media',
        public: true,
        allowedMimeTypes: [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'video/mp4', 'video/webm', 'video/ogg'
        ],
        fileSizeLimit: 10485760, // 10MB
        transformations: {
            enabled: false // Supabase doesn't have built-in image transformations
        }
    }
};

// AWS S3 Configuration (Pay-as-you-go pricing)
window.AWS_CONFIG = {
    region: 'us-east-1',                         // Replace with your AWS region
    bucket: 'jkuat-innovation-events',           // Replace with your S3 bucket
    accessKeyId: 'your-access-key',              // Replace with your access key
    secretAccessKey: 'your-secret-key',          // Replace with your secret key
    
    // CloudFront CDN (optional)
    cdnDomain: 'https://your-cdn-domain.cloudfront.net'
};

// Local Storage Configuration (Development only)
window.LOCAL_CONFIG = {
    useIndexedDB: true,        // Use IndexedDB for larger files
    useLocalStorage: false,    // Use localStorage for small files (limited to ~5MB)
    compressionEnabled: true,  // Compress images before storing
    
    // Fallback to external services for production
    fallbackToExternal: true
};

// Storage Provider Comparison and Recommendations
window.STORAGE_RECOMMENDATIONS = {
    development: {
        recommended: 'local',
        reason: 'No external dependencies, fast development cycle'
    },
    
    smallScale: {
        recommended: 'cloudinary',
        reason: 'Free tier sufficient, built-in image optimization, easy setup'
    },
    
    mediumScale: {
        recommended: 'supabase',
        reason: 'Good free tier, integrates with auth, PostgreSQL database'
    },
    
    largeScale: {
        recommended: 'aws',
        reason: 'Scalable, cost-effective for large volumes, enterprise features'
    }
};

// Helper function to get storage configuration
window.getStorageConfig = function(storageType) {
    switch (storageType) {
        case 'cloudinary':
            return window.CLOUDINARY_CONFIG;
        case 'supabase':
            return window.SUPABASE_CONFIG;
        case 'aws':
            return window.AWS_CONFIG;
        case 'local':
        default:
            return window.LOCAL_CONFIG;
    }
};

// Helper function to check if storage is properly configured
window.isStorageConfigured = function(storageType) {
    const config = window.getStorageConfig(storageType);
    
    switch (storageType) {
        case 'cloudinary':
            return config.cloudName && config.uploadPreset;
        case 'supabase':
            return config.url && config.anonKey;
        case 'aws':
            return config.region && config.bucket && config.accessKeyId;
        case 'local':
            return true; // Always available
        default:
            return false;
    }
};

// Initialize storage configuration
document.addEventListener('DOMContentLoaded', () => {
    console.log('📁 Media storage configuration loaded');
    console.log('Available storage types:', Object.keys(window.STORAGE_RECOMMENDATIONS));
    
    // Check which storage types are configured
    const configuredTypes = ['local', 'cloudinary', 'supabase', 'aws']
        .filter(type => window.isStorageConfigured(type));
    
    console.log('Configured storage types:', configuredTypes);
    
    if (configuredTypes.length === 1 && configuredTypes[0] === 'local') {
        console.warn('⚠️ Only local storage is configured. Consider setting up a cloud storage provider for production.');
    }
});