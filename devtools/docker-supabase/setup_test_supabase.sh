#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Function for section headers
print_header() {
  echo -e "\n${BLUE}${BOLD}====== $1 ======${NC}\n"
}

# Function for success messages
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function for info messages
print_info() {
  echo -e "${YELLOW}→ $1${NC}"
}

# Bbanner
echo -e "${BLUE}${BOLD}"
echo "   _____                           _____ _           _   "
echo "  / ____|                         / ____| |         | |  "
echo " | (___   ___  ___ _   _ _ __ ___| (___ | |__   ___ | |_ "
echo "  \___ \ / _ \/ __| | | | '__/ _ \\___ \| '_ \ / _ \| __|"
echo "  ____) |  __/ (__| |_| | | |  __/____) | | | | (_) | |_ "
echo " |_____/ \___|\___|\__,_|_|  \___|_____/|_| |_|\___/ \__|"
echo -e "${NC}\n"
echo -e "${YELLOW}Local Supabase Environment Setup${NC}\n"

DB_USER="supabase_admin"
DB_PASS="supabase_password"
DB_NAME="supabase_db"
DB_PORT=5432

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCHEMA_FILE="$PROJECT_ROOT/supabase/schema.sql"
POLICIES_FILE="$PROJECT_ROOT/supabase/policies.sql"
DOCKER_COMPOSE_PATH="$PROJECT_ROOT/devtools/docker-supabase/docker-compose.yml"

print_info "Project root detected as: ${BOLD}$PROJECT_ROOT${NC}"
print_info "Docker Compose file: ${BOLD}$DOCKER_COMPOSE_PATH${NC}"

cd "$(dirname "$DOCKER_COMPOSE_PATH")"

print_header "Starting Services"
print_info "Launching Postgres and Supabase services..."
docker compose --env-file docker-supabase.env up -d

print_header "Checking Database Connection"
print_info "Waiting for Postgres to be ready..."
until docker exec "$(docker compose --env-file docker-supabase.env ps -q db)" pg_isready -U "$DB_USER" > /dev/null 2>&1; do
  echo -ne "${YELLOW}.${NC}"
  sleep 1
done
echo ""
print_success "Postgres is ready and accepting connections!"

CONTAINER_ID=$(docker compose --env-file docker-supabase.env ps -q db)

print_header "Initializing Database"
print_info "Copying schema and policy SQL files into container..."
docker cp "$SCHEMA_FILE" "$CONTAINER_ID":/tmp/schema.sql
docker cp "$POLICIES_FILE" "$CONTAINER_ID":/tmp/policies.sql

print_info "Applying schema..."
docker exec -u postgres "$CONTAINER_ID" psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/schema.sql

print_info "Applying policies..."
docker exec -u postgres "$CONTAINER_ID" psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/policies.sql

print_success "Database schema and policies applied successfully!"

print_header "Verifying Setup"
echo -e "${YELLOW}Current database tables:${NC}"
docker exec -u postgres "$CONTAINER_ID" psql -U "$DB_USER" -d "$DB_NAME" -c '\dt'

print_header "Setup Complete"
echo -e "${GREEN}${BOLD}✅ Supabase local environment is ready!${NC}"
echo -e "${YELLOW}→ You can now start the full stack with:${NC}"
echo -e "${BLUE}   docker compose -f $DOCKER_COMPOSE_PATH up -d${NC}"
echo ""