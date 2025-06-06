# Local Supabase Development Environment

This Docker Compose setup provides a local Supabase environment for development.

## Services Included

- **PostgreSQL**: Database server
- **GoTrue**: Authentication service
- **PostgREST**: Auto-generated REST API
- **Storage API**: File storage service

## Quick Start

1. Start the services:
```bash
docker-compose up -d
```

2. The services will be available at:
- PostgreSQL: `localhost:5432`
- Auth API: `localhost:9999`
- REST API: `localhost:3000`
- Storage API: `localhost:5000`

3. Run the database schema:
```bash
# Connect to PostgreSQL and run the schema files
psql -h localhost -U postgres -d supabase -f ../../supabase/schema.sql
psql -h localhost -U postgres -d supabase -f ../../supabase/policies.sql
```

## Environment Variables

Update your `.env` files with these local endpoints:

```env
# Backend .env
SUPABASE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Frontend .env
REACT_APP_SUPABASE_URL=http://localhost:3000
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Stopping Services

```bash
docker-compose down
```

## Resetting Data

```bash
docker-compose down -v
docker-compose up -d
```

This will remove all volumes and start fresh.