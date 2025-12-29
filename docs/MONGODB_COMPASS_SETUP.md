# MongoDB Compass Setup Guide

## What is MongoDB Compass?
MongoDB Compass is the official graphical user interface (GUI) for MongoDB. It allows you to visually explore your data, run queries, and manage your database without writing code.

## Installation Steps

### 1. Download MongoDB Compass
- Go to: https://www.mongodb.com/products/compass
- Click "Download Compass"
- Choose your operating system (Windows)
- Download the installer

### 2. Install MongoDB Compass
- Run the downloaded installer
- Follow the installation wizard
- Accept the license agreement
- Choose installation directory (default is fine)
- Complete the installation

### 3. Connect to Your Database
1. **Open MongoDB Compass**
2. **Connection String**: Use one of these options:

   **Option A: Local MongoDB (if running locally)**
   ```
   mongodb://localhost:27017/jkuat-innovation-club
   ```

   **Option B: If using authentication**
   ```
   mongodb://username:password@localhost:27017/jkuat-innovation-club
   ```

3. **Click "Connect"**

## What You'll See in Compass

### Database Overview
- **Database Name**: `jkuat-innovation-club`
- **Collections**: You'll see all your collections (tables)

### Collections in Your Database
- `users` - Student profiles and accounts
- `events` - Club events and workshops
- `payments` - Payment transactions
- `ideas` - Innovation ideas submitted
- `messages` - Direct messages between users
- `groups` - Group messaging channels
- `notifications` - System notifications
- `opportunities` - Job/internship listings
- `resources` - Learning materials
- `documents` - File uploads
- `faqs` - Frequently asked questions
- `supporttickets` - Help desk tickets
- `membershipcards` - Digital membership cards
- `leaderships` - Club leadership information

## Using MongoDB Compass

### 1. Browse Collections
- Click on any collection name to view documents
- Use the filter bar to search for specific documents
- Sort and limit results as needed

### 2. View Documents
- Each document represents a record (like a user, event, etc.)
- Documents are displayed in JSON format
- You can expand/collapse nested fields

### 3. Query Data
**Find all active users:**
```json
{ "membershipStatus": "Active" }
```

**Find users by college:**
```json
{ "college": "COETEC" }
```

**Find recent events:**
```json
{ "createdAt": { "$gte": "2024-01-01" } }
```

**Find completed payments:**
```json
{ "status": "completed" }
```

### 4. Useful Features
- **Schema Tab**: See the structure of your data
- **Explain Plan**: Understand query performance
- **Indexes**: View and create database indexes
- **Validation**: Set up data validation rules

## Alternative: Web-Based Database Manager

If you prefer not to install software, you can use the built-in web interface:

1. **Access**: Go to http://localhost:3000/database
2. **Features**:
   - View database statistics
   - Browse users, events, payments
   - Search and filter data
   - Execute custom queries
   - Real-time data updates

## MongoDB Atlas (Cloud Option)

For a cloud-based solution:

1. **Sign up**: Go to https://www.mongodb.com/atlas
2. **Create Cluster**: Choose the free tier (512MB)
3. **Get Connection String**: Copy the connection string
4. **Update .env**: Replace `MONGODB_URI` with Atlas connection string
5. **Benefits**:
   - No local MongoDB installation needed
   - Built-in web interface
   - Automatic backups
   - Better for production

## Troubleshooting

### Connection Issues
- **Check MongoDB Service**: Ensure MongoDB is running
- **Port**: Default port is 27017
- **Firewall**: Make sure port 27017 is not blocked

### Common Commands
```bash
# Check if MongoDB is running (Windows)
net start MongoDB

# Check port usage
netstat -an | findstr :27017
```

### Getting Help
- **MongoDB Compass Docs**: https://docs.mongodb.com/compass/
- **Community Forums**: https://community.mongodb.com/
- **Club Support**: Contact the technical team

## Security Notes

- **Local Development**: Current setup is for development only
- **Production**: Enable authentication and use secure connections
- **Backups**: Regular backups are recommended
- **Access Control**: Limit database access to authorized users only

## Quick Tips

1. **Favorites**: Save frequently used queries as favorites
2. **Export**: Export query results to JSON or CSV
3. **Import**: Import data from JSON or CSV files
4. **Performance**: Use the Performance tab to monitor slow queries
5. **Real-time**: Enable real-time updates to see changes as they happen