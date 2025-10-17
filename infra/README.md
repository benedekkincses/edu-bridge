# Infrastructure Setup

This directory contains all Docker and infrastructure configuration files for the EduBridge project.

## Quick Start

1. **Copy environment variables:**
   ```bash
   cp ../.env.example ../.env
   ```

2. **Start PostgreSQL:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d postgres
   ```

3. **Check PostgreSQL is running:**
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

4. **View logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f postgres
   ```

5. **Stop services:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Services

### PostgreSQL (Port 5432)

PostgreSQL 15 database for storing all application data.

**Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `edubridge`
- User: `edubridge`
- Password: Set in `.env` as `DB_PASSWORD`

**Connection String:**
```
postgresql://edubridge:devpassword123@localhost:5432/edubridge
```

**Health Check:**
```bash
docker exec edubridge-postgres-dev pg_isready -U edubridge -d edubridge
```

**Connect via psql:**
```bash
docker exec -it edubridge-postgres-dev psql -U edubridge -d edubridge
```

**Database Commands:**
```sql
-- List all databases
\l

-- List all tables
\dt

-- Describe a table
\d table_name

-- Exit
\q
```

### Data Persistence

All database data is stored in Docker volumes:
- `postgres_data`: PostgreSQL data directory

**View volumes:**
```bash
docker volume ls | grep edubridge
```

**Remove volumes (WARNING: Deletes all data):**
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Future Services

The following services will be added to this configuration:

- **Keycloak** (Port 8080): Authentication and authorization
- **MinIO** (Port 9000, Console 9001): S3-compatible object storage
- **API Server** (Port 3000): Node.js backend (in production)
- **Nginx** (Port 80, 443): Reverse proxy (in production)

## Development vs Production

### docker-compose.dev.yml
- For local development
- Exposed ports for direct access
- Development-friendly settings
- Hot reload support

### docker-compose.yml (future)
- For production deployment
- Services behind Nginx reverse proxy
- Production-optimized settings
- SSL/TLS configuration
- No exposed database ports

## Networking

All services are connected via the `edubridge-network` bridge network, allowing them to communicate using service names as hostnames.

**Example:** The API service can connect to PostgreSQL using `postgres:5432` instead of `localhost:5432`.

## Troubleshooting

### Port Already in Use

If port 5432 is already in use by a local PostgreSQL instance:

```bash
# Stop local PostgreSQL (macOS)
brew services stop postgresql

# Or change the port in docker-compose.dev.yml
ports:
  - "5433:5432"  # Maps container port 5432 to host port 5433

# Then update DATABASE_URL in .env
DATABASE_URL=postgresql://edubridge:devpassword123@localhost:5433/edubridge
```

### Container Won't Start

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs postgres

# Remove container and try again
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Permission Issues

```bash
# Remove volumes and recreate
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Connection Refused

Make sure:
1. Container is running: `docker-compose -f docker-compose.dev.yml ps`
2. Health check passes: `docker-compose -f docker-compose.dev.yml ps` (should show "healthy")
3. `.env` file exists with correct `DATABASE_URL`
4. No firewall blocking port 5432

## Backup and Restore

### Backup Database

```bash
# Backup to file
docker exec edubridge-postgres-dev pg_dump -U edubridge edubridge > backup.sql

# Backup with compression
docker exec edubridge-postgres-dev pg_dump -U edubridge edubridge | gzip > backup.sql.gz
```

### Restore Database

```bash
# Restore from file
docker exec -i edubridge-postgres-dev psql -U edubridge edubridge < backup.sql

# Restore from compressed file
gunzip < backup.sql.gz | docker exec -i edubridge-postgres-dev psql -U edubridge edubridge
```

## Init Scripts

Place SQL initialization scripts in `./init-scripts/` directory. They will be executed automatically when the database is first created (in alphabetical order).

Example:
```bash
mkdir init-scripts
echo "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" > init-scripts/01-extensions.sql
```

These scripts only run on first initialization. To re-run them, remove the volume:
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres
```

## Resources

- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
