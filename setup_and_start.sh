#!/bin/bash

# SecureShot Deployment Script
# ----------------------------
# This script sets up and starts the SecureShot application
# with proper database connections and environment testing.

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BOLD}${BLUE}"
echo "====================================================="
echo "        SecureShot Application Deployment            "
echo "====================================================="
echo -e "${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in root directory${NC}"
    echo "Please make sure you have a valid .env file with Supabase and PayPal credentials"
    exit 1
fi

# Function to test Supabase connection
test_supabase_connection() {
    echo -e "${YELLOW}Testing Supabase connection...${NC}"
    
    # Get Supabase credentials from .env
    SUPABASE_URL=$(grep SUPABASE_URL .env | cut -d '=' -f2)
    SUPABASE_KEY=$(grep SUPABASE_SERVICE_KEY .env | cut -d '=' -f2)
    
    # Simple test using curl
    response=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_KEY")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Supabase connection successful!${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to connect to Supabase. Please check your credentials.${NC}"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install backend dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Backend dependencies installed successfully${NC}"
    
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd ../frontend && npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install frontend dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Frontend dependencies installed successfully${NC}"
    
    cd ..
}

# Function to copy environment variables
setup_environment() {
    echo -e "${YELLOW}Setting up environment variables...${NC}"
    
    # Copy main .env variables to frontend
    if [ ! -f frontend/.env ]; then
        echo -e "VITE_SUPABASE_URL=$(grep SUPABASE_URL .env | cut -d '=' -f2)" > frontend/.env
        echo -e "VITE_SUPABASE_ANON_KEY=$(grep SUPABASE_ANON_KEY .env | cut -d '=' -f2)" >> frontend/.env
        echo -e "VITE_API_URL=http://localhost:3001" >> frontend/.env
    fi
    
    echo -e "SUPABASE_URL=$(grep SUPABASE_URL .env | cut -d '=' -f2)" > backend/.env
    echo -e "SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_KEY .env | cut -d '=' -f2)" >> backend/.env
    echo -e "PAYPAL_CLIENT_ID=$(grep PAYPAL_CLIENT_ID .env | cut -d '=' -f2)" >> backend/.env
    echo -e "PAYPAL_CLIENT_SECRET=$(grep PAYPAL_CLIENT_SECRET .env | cut -d '=' -f2)" >> backend/.env
    echo -e "FRONTEND_URL=http://localhost:5173" >> backend/.env
    
    echo -e "${GREEN}✅ Environment variables set up successfully${NC}"
}

# Start development servers
start_servers() {
    echo -e "${YELLOW}Starting backend server...${NC}"
    npm run dev:backend &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 3
    
    echo -e "${YELLOW}Starting frontend development server...${NC}"
    npm run dev:frontend &
    FRONTEND_PID=$!
    
    echo -e "${GREEN}✅ Development servers started!${NC}"
    echo -e "${BLUE}Backend running at: ${BOLD}http://localhost:3001${NC}"
    echo -e "${BLUE}Frontend running at: ${BOLD}http://localhost:5173${NC}"
    
    # Keep script running and capture Ctrl+C to clean up
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Main execution flow
echo -e "${YELLOW}Setting up SecureShot application...${NC}"

# Test Supabase connection first
test_supabase_connection
if [ $? -ne 0 ]; then
    echo -e "${RED}Please check your Supabase credentials in .env file and try again.${NC}"
    exit 1
fi

# Install dependencies
install_dependencies

# Setup environment
setup_environment

# Check if PayPal credentials are set
if grep -q "a ajouter" .env; then
    echo -e "${YELLOW}⚠️  Warning: PayPal credentials are not properly configured.${NC}"
    echo -e "${YELLOW}Payment functionality will not work until you update the .env file.${NC}"
fi

# Start servers
echo -e "${GREEN}All checks passed! Starting development servers...${NC}"
start_servers