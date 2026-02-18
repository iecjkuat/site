# CMS and News Page Integration

## Overview
The News & Articles page and CMS are now fully integrated. Articles created/edited in the CMS will automatically appear on the News page, and vice versa.

## Integration Points

### 1. Shared Database Table
Both systems use the same `articles` table in the database:
- **Table**: `articles`
- **Columns**: id, title, content, excerpt, category, tags, featured_image, author_id, status, views, likes, created_at, updated_at, published_at

### 2. Shared API Endpoints
Both systems use the same REST API:
- **Base URL**: `/api/v1/content/articles`
- **Endpoints**:
  - `GET /api/v1/content/articles` - List all articles
  - `GET /api/v1/content/articles/:id` - Get single article
  - `POST /api/v1/content/articles` - Create article (Admin/Executive only)
  - `PUT /api/v1/content/articles/:id` - Update article (Admin/Executive only)
  - `DELETE /api/v1/content/articles/:id` - Delete article (Admin/Executive only)

### 3. Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   CMS Page  │ ◄─────► │  API Routes  │ ◄─────► │  Database   │
│  (Admin)    │         │  /content/   │         │  articles   │
└─────────────┘         │  articles    │         │   table     │
                        └──────────────┘         └─────────────┘
                               ▲                         ▲
                               │                         │
                               └─────────────────────────┘
                                         │
                                         ▼
                                ┌─────────────┐
                                │  News Page  │
                                │  (Public)   │
                                └─────────────┘
```

## CMS Features for Articles

### View Articles
- Navigate to CMS → Articles tab
- See all published articles
- Filter by category, status, date range
- Search by title, content, or tags

### Create Article
1. Click "Create Article" button in CMS
2. Fill in form:
   - Title (required)
   - Content (required)
   - Excerpt (optional, auto-generated from content if empty)
   - Category: 'news' or 'article' (required)
   - Tags (optional, comma-separated)
   - Featured Image URL (optional)
   - Status: 'draft', 'published', or 'archived'
3. Click "Save"
4. Article appears immediately on News page (if published)

### Edit Article
1. Click "Edit" button on article card
2. Modify fields
3. Click "Save Changes"
4. Changes reflect immediately on News page

### Delete Article
1. Click "Delete" button on article card
2. Confirm deletion
3. Article removed from both CMS and News page

## News Page Features

### Public View
- Browse all published articles
- Filter by category (All, News, Articles)
- Search across titles, excerpts, and tags
- Sort by date or title
- Click "Read More" to view full article in modal
- Share articles via native share API or clipboard

### Automatic Updates
- New articles created in CMS appear immediately
- Edited articles update in real-time
- Deleted articles disappear from view
- View counts increment when articles are read

## Setup Checklist

- [x] Database table created (`supabase/13-articles-table.sql`)
- [x] Missing columns added (`supabase/16-update-articles-schema.sql`)
- [x] Sample data inserted (`supabase/14-insert-articles-data.sql`)
- [x] API endpoints configured (`routes/content.js`)
- [x] CMS API updated to use correct endpoints (`pages/cms/modules/cms-api.js`)
- [x] CMS manager updated to remove mock data (`pages/cms/modules/cms-manager.js`)
- [x] News page updated to use real API (`pages/news/news.js`)
- [x] News page HTML simplified (removed events/announcements)

## Testing

### Test CMS Integration
1. Navigate to `/cms`
2. Click "Articles" tab
3. Verify articles load from database
4. Create a new article
5. Verify it appears in the list

### Test News Page
1. Navigate to `/news`
2. Verify articles display
3. Test filtering (All, News, Articles)
4. Test search functionality
5. Click "Read More" on an article
6. Verify modal displays full content

### Test Integration
1. Create article in CMS
2. Navigate to `/news`
3. Verify new article appears
4. Edit article in CMS
5. Refresh `/news`
6. Verify changes appear
7. Delete article in CMS
8. Refresh `/news`
9. Verify article is gone

## Permissions

### Public Users
- View published articles on News page
- Search and filter
- Read full content
- Share articles

### Admin/Executive Users
- All public permissions
- Create articles via CMS
- Edit own articles
- Delete own articles
- Admins can edit/delete any article

## No Mock Data
Both systems now use ONLY real database data:
- ❌ No mock data fallbacks
- ❌ No hardcoded sample content
- ✅ All data from database via API
- ✅ Proper error handling when data unavailable

## Future Enhancements
- Rich text editor for article content (Quill.js already available in CMS)
- Image upload for featured images
- Draft auto-save
- Scheduled publishing
- Article categories management
- Tags management
- Comment system
- Like/bookmark functionality
- Related articles suggestions
- Email notifications for new articles
