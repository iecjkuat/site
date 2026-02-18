# News & Articles System Documentation

## Overview
The News & Articles system provides a simple, focused platform for sharing news updates and in-depth articles with club members. The system is intentionally minimal, focusing only on news and articles without events or announcements (which have their own dedicated pages).

## Database Schema

### Articles Table
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR(50) CHECK (category IN ('news', 'article')),
  tags TEXT[],
  featured_image VARCHAR(500),
  author_id UUID REFERENCES users(id),
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  published_at TIMESTAMP
);
```

## Content Types

### News
- Short-form updates about club activities, achievements, partnerships
- Typically 200-500 words
- Time-sensitive information
- Examples: competition wins, new partnerships, lab upgrades

### Articles
- Long-form educational or informative content
- Typically 800-2000 words
- Evergreen content that remains relevant
- Examples: technical tutorials, industry insights, guides

## API Endpoints

### Get All Articles
```
GET /api/v1/content/articles
Query Parameters:
  - page: Page number (default: 1)
  - limit: Items per page (default: 10)
  - category: Filter by 'news' or 'article'
  - status: Filter by status (default: 'published')
```

### Get Single Article
```
GET /api/v1/content/articles/:id
```

### Create Article (Admin/Executive Only)
```
POST /api/v1/content/articles
Body: {
  title: string,
  content: string,
  excerpt: string (optional),
  category: 'news' | 'article',
  tags: string[],
  featured_image: string (URL),
  status: 'draft' | 'published' | 'archived'
}
```

### Update Article (Admin/Executive Only)
```
PUT /api/v1/content/articles/:id
Body: Same as create
```

### Delete Article (Admin/Executive Only)
```
DELETE /api/v1/content/articles/:id
```

## Frontend Features

### Filtering
- All: Shows both news and articles
- News: Shows only news items
- Articles: Shows only articles

### Search
- Real-time search across titles, excerpts, and tags
- Debounced for performance (300ms delay)

### Sorting
- Newest First (default)
- Oldest First
- Title A-Z
- Title Z-A

### Pagination
- 12 items per page
- "Load More" button for additional content

### Article View
- Click "Read More" to open full article in modal
- Modal displays full content with formatting
- Automatically increments view count
- Share functionality (native share API or clipboard)

## Permissions

### Public Access
- View published articles
- Search and filter
- Read full content
- Share articles

### Admin/Executive Access
- Create new articles
- Edit own articles
- Delete own articles
- Admins can edit/delete any article

## Setup Instructions

1. **Create Database Table**
   ```bash
   # Run in Supabase SQL Editor
   supabase/13-articles-table.sql
   ```

2. **Insert Sample Data**
   ```bash
   # Run in Supabase SQL Editor
   supabase/14-insert-articles-data.sql
   ```

3. **Verify Installation**
   - Navigate to `/news` page
   - Should see 10 sample articles (5 news, 5 articles)
   - Test filtering, search, and sorting
   - Click "Read More" to view full article

## Design Principles

1. **Simplicity**: Only news and articles, no other content types
2. **Focus**: Each content type has a clear purpose
3. **Performance**: Efficient loading and rendering
4. **User Experience**: Clean interface, easy navigation
5. **Real Data**: No mock data or fallbacks

## Future Enhancements (Optional)

- Like/bookmark functionality
- Comment system
- Related articles suggestions
- Author profiles
- Rich text editor for content creation
- Image upload for featured images
- Draft auto-save
- Scheduled publishing
- Email notifications for new articles
- RSS feed
