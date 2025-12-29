# Universal Database Architecture Guide

This guide covers the new universal database architecture that supports multiple database providers and easy migration between them.

## Overview

The new architecture provides:
- **Universal Database Support**: PostgreSQL, MySQL, SQLite, MongoDB, CockroachDB
- **Database Abstraction Layer**: Consistent API regardless of underlying database
- **Easy Migration**: Automated migration between different database providers
- **Future-Proof**: Easy to add new database providers
- **Multi-tenant**: Support for multiple clubs with data isolation

## Supported Databases

### PostgreSQL (Recommended for Production)
- **Best for**: Large-scale applications, complex queries, multi-tenancy
- **Features**: Full ACID compliance, JSON support, arrays, full-text search
- **Use with**: Supabase (managed) or self-hosted

### MySQL
- **Best for**: Web applications, wide hosting support
- **Features**: Good performance, mature ecosystem
- **Limitations**: No native array support, fewer advanced features

### SQLite
- **Best for**: Development, testing, small applications
- **Features**: Zero configuration, file-based, lightweight
- **Limitations**: No concurrent writes, limited scalability

### MongoDB
- **Best for**: Rapid development, flexible schemas
- **Features**: Document-based, horizontal scaling, rich queries
- **Limitations**: No ACID across documents, memory intensive

### CockroachDB
- **Best for**: Global applications, high availability
- **Features**: Distributed SQL, automatic scaling, strong consistency
- **Limitations**: Complex setup, higher costs

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v13 or higher) or **Supabase account**
3. **Git** for version control

## Quick Start

### Step 1: Choose Your Database Provider

Set the database provider in your environment:

```bash
# PostgreSQL with Supabase (Recommended)
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# MySQL
DATABASE_PROVIDER=mysql
DATABASE_URL="mysql://user:password@localhost:3306/jkuat_clubs"

# SQLite (Development)
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"

# MongoDB
DATABASE_PROVIDER=mongodb
DATABASE_URL="mongodb://localhost:27017/jkuat_clubs"

# CockroachDB
DATABASE_PROVIDER=cockroachdb
DATABASE_URL="postgresql://user:password@cluster.cockroachlabs.cloud:26257/jkuat_clubs"
```

### Step 2: Use Universal Server

The universal server automatically detects and configures the database:

```bash
node server-universal.js
```

## Database Migration

### Automated Migration Between Providers

Use the migration script to move between databases:

```bash
# Migrate from MongoDB to PostgreSQL
node scripts/migrate-database.js mongodb postgresql

# Migrate from SQLite to MySQL
node scripts/migrate-database.js sqlite mysql --batch-size 500

# Validate migration compatibility (no actual migration)
node scripts/migrate-database.js postgresql cockroachdb --validate-only

# Generate migration report
node scripts/migrate-database.js mysql postgresql --report
```

### Migration Options

- `--batch-size <size>`: Records per batch (default: 100)
- `--force`: Force migration despite warnings
- `--validate-only`: Only validate compatibility
- `--report`: Generate detailed migration report

## Step 3: Install Dependencies

1. Install PostgreSQL dependencies:
```bash
npm install --save-exact @prisma/client@5.6.0 prisma@5.6.0 @supabase/supabase-js@2.38.0
```

2. Or use the pre-configured package file:
```bash
cp package-postgresql.json package.json
npm install
```

## Step 4: Database Schema Setup

1. Generate Prisma client:
```bash
npx prisma generate
```

2. Push schema to database:
```bash
npx prisma db push
```

3. (Optional) Run database initialization script:
```bash
# If using Supabase, run this in the SQL editor
cat scripts/init-postgresql.sql
```

## Step 5: Seed Database

1. Run the seed script to populate with sample data:
```bash
npm run db:seed
```

This creates:
- JKUAT Innovation and Entrepreneurship Club
- Sample users (admin and members)
- Sample events, ideas, resources, opportunities
- Sample messages and support tickets

## Step 6: Start the Server

1. Use the PostgreSQL server:
```bash
node server-postgresql.js
```

2. Or update your npm scripts in `package.json`:
```json
{
  "scripts": {
    "start": "node server-postgresql.js",
    "dev": "nodemon server-postgresql.js"
  }
}
```

## Step 7: Test the Migration

1. **Health Check**: Visit `http://localhost:3000/health`
2. **API Documentation**: Visit `http://localhost:3000/api`
3. **Login Test**: Use credentials from seed data:
   - Admin: `admin@jkuatinnovation.ac.ke` / `admin123`
   - User: `john.doe@student.jkuat.ac.ke` / `password123`

## Key Differences from MongoDB Version

### 1. Database Structure
- **MongoDB**: Document-based with embedded objects
- **PostgreSQL**: Relational with foreign keys and joins
- **Benefits**: Better data integrity, ACID compliance, complex queries

### 2. Authentication
- **Old**: Custom JWT with bcrypt
- **New**: Supabase Auth + Prisma for user management
- **Benefits**: Built-in auth features, better security, easier scaling

### 3. Multi-tenancy
- **Old**: Single club per deployment
- **New**: Multiple clubs in one database with RLS
- **Benefits**: Cost-effective, easier maintenance, better resource utilization

### 4. API Structure
- **Old**: Direct MongoDB queries
- **New**: Prisma ORM with type safety
- **Benefits**: Type safety, better performance, easier maintenance

## Data Migration (if needed)

If you have existing MongoDB data to migrate:

1. **Export MongoDB data**:
```bash
mongoexport --db jkuat_clubs --collection users --out users.json
mongoexport --db jkuat_clubs --collection events --out events.json
# ... repeat for other collections
```

2. **Create migration script** (example for users):
```javascript
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function migrateUsers() {
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  
  for (const user of users) {
    await prisma.user.create({
      data: {
        // Map MongoDB fields to PostgreSQL schema
        name: user.name,
        email: user.email,
        // ... other fields
      }
    });
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Error**:
   - Check DATABASE_URL format
   - Verify network access to database
   - Ensure database exists

2. **Prisma Generate Fails**:
   - Check schema.prisma syntax
   - Ensure @prisma/client is installed
   - Try `npx prisma generate --force`

3. **Seed Script Fails**:
   - Ensure database is empty or use upsert operations
   - Check for constraint violations
   - Verify foreign key relationships

4. **Authentication Issues**:
   - Verify Supabase keys are correct
   - Check CORS settings in Supabase dashboard
   - Ensure JWT_SECRET is set

### Performance Optimization

1. **Database Indexes**: Already included in init script
2. **Connection Pooling**: Configured in Prisma
3. **Query Optimization**: Use Prisma's query optimization features

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL="your-production-db-url"
SUPABASE_URL="your-production-supabase-url"
SUPABASE_ANON_KEY="your-production-anon-key"
SUPABASE_SERVICE_KEY="your-production-service-key"
```

### Security Checklist
- [ ] Enable RLS policies in production
- [ ] Use environment variables for all secrets
- [ ] Enable SSL for database connections
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging
- [ ] Regular database backups

## Monitoring and Maintenance

1. **Database Monitoring**:
   - Use Supabase dashboard for metrics
   - Monitor query performance
   - Set up alerts for errors

2. **Application Monitoring**:
   - Log all database operations
   - Monitor API response times
   - Track user authentication flows

3. **Regular Maintenance**:
   - Update dependencies regularly
   - Monitor database size and performance
   - Review and optimize queries

## Support

For issues with this migration:

1. Check the [Prisma documentation](https://www.prisma.io/docs)
2. Review [Supabase documentation](https://supabase.com/docs)
3. Check application logs for specific errors
4. Verify environment configuration

## Next Steps

After successful migration:

1. **Frontend Updates**: Update frontend to use new API endpoints
2. **Testing**: Comprehensive testing of all features
3. **Documentation**: Update API documentation
4. **Training**: Train team on new architecture
5. **Monitoring**: Set up production monitoring

The PostgreSQL + Supabase architecture provides better scalability, data integrity, and multi-tenancy support for the JKUAT Clubs Platform.

## Universal Database API

### Using the Database Abstraction Layer

The universal database client provides a consistent API:

```javascript
const database = require('./lib/database');

// Initialize (automatic)
await database.initialize();

// CRUD operations work the same across all databases
const users = await database.user.findMany({
  where: { clubId: 'some-club-id' },
  include: { club: true }
});

const newUser = await database.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    clubId: 'some-club-id'
  }
});

// Feature detection
if (await database.supportsFeature('fullTextSearch')) {
  // Use full-text search
}

// Provider-specific optimizations
const provider = await database.getProvider();
if (provider === 'postgresql') {
  // Use PostgreSQL-specific features
}
```

### Database-Specific Schemas

Each database has its own optimized schema:

- `prisma/schema.prisma` - PostgreSQL (with full features)
- `prisma/schema-mysql.prisma` - MySQL (JSON arrays, no native arrays)
- `prisma/schema-sqlite.prisma` - SQLite (strings for enums, limited features)
- MongoDB uses dynamic schemas with the abstraction layer

### Adding New Database Providers

1. **Add Provider Configuration** in `lib/database-factory.js`:
```javascript
newdb: {
  url: process.env.NEWDB_URL,
  provider: 'newdb',
  features: {
    transactions: true,
    foreignKeys: true,
    // ... other features
  }
}
```

2. **Create Schema** (if SQL-based):
```prisma
// prisma/schema-newdb.prisma
datasource db {
  provider = "newdb"
  url      = env("DATABASE_URL")
}
// ... models
```

3. **Implement Client** in `database-factory.js`:
```javascript
async getNewDbClient() {
  const { NewDbClient } = require('newdb-client');
  const client = new NewDbClient(this.config.url);
  await client.connect();
  return client;
}
```

4. **Add Query Builder** if needed:
```javascript
class NewDbQueryBuilder {
  // Implement query translation methods
}
```

## Environment Configuration Examples

### PostgreSQL + Supabase
```env
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_KEY="[YOUR-SERVICE-KEY]"
```

### MySQL
```env
DATABASE_PROVIDER=mysql
DATABASE_URL="mysql://user:password@localhost:3306/jkuat_clubs"
```

### SQLite (Development)
```env
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

### MongoDB
```env
DATABASE_PROVIDER=mongodb
DATABASE_URL="mongodb://localhost:27017/jkuat_clubs"
```

### CockroachDB
```env
DATABASE_PROVIDER=cockroachdb
DATABASE_URL="postgresql://user:password@cluster.cockroachlabs.cloud:26257/jkuat_clubs?sslmode=require"
```

## Performance Considerations

### Database-Specific Optimizations

**PostgreSQL:**
- Use JSONB for better JSON performance
- Leverage array operations for tags/skills
- Use full-text search for content
- Implement proper indexing strategy

**MySQL:**
- Use JSON columns carefully (performance impact)
- Optimize for InnoDB storage engine
- Consider partitioning for large tables

**SQLite:**
- Keep database size reasonable (< 1GB)
- Use WAL mode for better concurrency
- Avoid complex joins on large datasets

**MongoDB:**
- Design for document structure
- Use proper indexing strategy
- Consider sharding for scale
- Optimize aggregation pipelines

**CockroachDB:**
- Design for distributed architecture
- Use proper partitioning strategy
- Consider geo-partitioning for global apps

### Migration Performance Tips

1. **Batch Processing**: Use appropriate batch sizes (100-1000 records)
2. **Parallel Processing**: Migrate independent tables in parallel
3. **Index Management**: Drop indexes during migration, recreate after
4. **Connection Pooling**: Use connection pools for better performance
5. **Monitoring**: Monitor memory and CPU usage during migration

## Production Deployment

### Database Selection Criteria

**Choose PostgreSQL when:**
- Complex data relationships
- Need ACID compliance
- Advanced features required (JSON, arrays, full-text search)
- Multi-tenant architecture
- Large scale applications

**Choose MySQL when:**
- Wide hosting support needed
- Team familiar with MySQL
- Standard web application
- Good performance requirements

**Choose SQLite when:**
- Small applications
- Single-user scenarios
- Development/testing
- Embedded applications

**Choose MongoDB when:**
- Flexible schema requirements
- Rapid development needed
- Document-oriented data
- Horizontal scaling required

**Choose CockroachDB when:**
- Global distribution needed
- High availability critical
- Strong consistency required
- Automatic scaling desired

### Deployment Checklist

- [ ] Choose appropriate database for use case
- [ ] Set up production database instance
- [ ] Configure connection pooling
- [ ] Set up monitoring and alerting
- [ ] Implement backup strategy
- [ ] Configure security (SSL, authentication)
- [ ] Test migration process in staging
- [ ] Plan rollback strategy
- [ ] Document configuration and procedures

## Troubleshooting

### Common Issues

**Connection Problems:**
```bash
# Test database connection
node -e "require('./lib/database').healthCheck().then(console.log)"
```

**Migration Failures:**
```bash
# Validate before migrating
node scripts/migrate-database.js source target --validate-only

# Use smaller batch sizes
node scripts/migrate-database.js source target --batch-size 50
```

**Performance Issues:**
```bash
# Check database features
curl http://localhost:3000/api/database/info

# Monitor during migration
node scripts/migrate-database.js source target --report
```

### Getting Help

1. Check the database provider's documentation
2. Review application logs for specific errors
3. Test with smaller datasets first
4. Use validation mode before actual migration
5. Check feature compatibility between providers

The universal architecture ensures your application can adapt to changing requirements and easily migrate between database providers as your needs evolve.