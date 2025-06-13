#!/bin/bash

# ╔════════════════════════════════════════════════════════════╗
# ║               SecureShot Deployment Script                 ║
# ╚════════════════════════════════════════════════════════════╝

set -euo pipefail

# ────────────────────────────────
# Formatting
# ────────────────────────────────
BOLD='\033[1m'
RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'

# ────────────────────────────────
# Welcome Banner
# ────────────────────────────────
echo -e "${BOLD}${PURPLE}"
cat << "EOF"

╔══════════════════════════════════════════════════════════════════════════════╗
║            ____                           ____  _           _                ║
║           / ___|  ___  ___ _   _ _ __ ___/ ___|| |__   ___ | |_              ║
║           \___ \ / _ \/ __| | | | '__/ _ \___ \| '_ \ / _ \| __|             ║
║            ___) |  __/ (__| |_| | | |  __/___) | | | | (_) | |_              ║
║           |____/ \___|\___|\__,_|_|  \___|____/|_| |_|\___/ \__|             ║
║                                                                              ║
║                     By Enzo LAUGEL and Loïc Philippe                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
                                                      
EOF
echo -e "${RESET}${CYAN}Initializing SecureShot Deployment...${RESET}"

# ────────────────────────────────
# Validate .env presence
# ────────────────────────────────
if [[ ! -f .env ]]; then
  echo -e "${RED}✘ Error: .env file missing in the root directory.${RESET}"
  echo "Ensure you provide a valid .env with Supabase and PayPal credentials."
  exit 1
fi

# ────────────────────────────────
# Supabase connection check
# ────────────────────────────────
test_supabase_connection() {
  echo -e "${YELLOW}🔌 Testing Supabase connection...${RESET}"

  local url key response
  url=$(grep "^SUPABASE_URL=" .env | cut -d '=' -f2-)
  key=$(grep "^SUPABASE_SERVICE_KEY=" .env | cut -d '=' -f2-)

  response=$(curl -s -o /dev/null -w "%{http_code}" \
    "$url/rest/v1/" \
    -H "apikey: $key")

  if [[ "$response" == "200" ]]; then
    echo -e "${GREEN}✔ Supabase connection successful.${RESET}"
  else
    echo -e "${RED}✘ Failed to connect to Supabase. Check credentials.${RESET}"
    return 1
  fi
}

# ────────────────────────────────
# Dependency installation
# ────────────────────────────────
install_dependencies() {
  echo -e "${YELLOW}📦 Installing backend dependencies...${RESET}"
  (
    cd backend
    npm install
  )
  echo -e "${GREEN}✔ Backend dependencies installed.${RESET}"

  echo -e "${YELLOW}📦 Installing frontend dependencies...${RESET}"
  (
    cd frontend
    npm install
    npm install react-hot-toast
  )
  echo -e "${GREEN}✔ Frontend dependencies installed.${RESET}"
}

# ────────────────────────────────
# Environment configuration
# ────────────────────────────────
setup_environment() {
  echo -e "${YELLOW}🔧 Configuring environment variables...${RESET}"

  local frontend_env="frontend/.env"
  local backend_env="backend/.env"

  [[ ! -f "$frontend_env" ]] && {
    {
      echo "VITE_SUPABASE_URL=$(grep SUPABASE_URL .env | cut -d '=' -f2-)"
      echo "VITE_SUPABASE_ANON_KEY=$(grep SUPABASE_ANON_KEY .env | cut -d '=' -f2-)"
      echo "VITE_API_URL=http://localhost:3001"
    } > "$frontend_env"
  }

  {
    echo "SUPABASE_URL=$(grep SUPABASE_URL .env | cut -d '=' -f2-)"
    echo "SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_KEY .env | cut -d '=' -f2-)"
    echo "PAYPAL_CLIENT_ID=$(grep PAYPAL_CLIENT_ID .env | cut -d '=' -f2-)"
    echo "PAYPAL_CLIENT_SECRET=$(grep PAYPAL_CLIENT_SECRET .env | cut -d '=' -f2-)"
    echo "FRONTEND_URL=http://localhost:5173"
  } > "$backend_env"

  echo -e "${GREEN}✔ Environment variables set.${RESET}"
}

# ────────────────────────────────
# Server startup
# ────────────────────────────────
start_servers() {
  echo -e "${YELLOW}🚀 Launching backend server...${RESET}"
  npm run dev:backend &
  BACKEND_PID=$!

  sleep 3

  echo -e "${YELLOW}🚀 Launching frontend server...${RESET}"
  npm run dev:frontend &
  FRONTEND_PID=$!

  echo -e "${GREEN}✔ Development servers running!${RESET}"
  echo -e "${CYAN}→ Backend:   ${BOLD}http://localhost:3001${RESET}"
  echo -e "${CYAN}→ Frontend:  ${BOLD}http://localhost:5173${RESET}"

  trap 'echo -e "\n${RED}✘ Caught SIGINT. Shutting down...${RESET}"; kill $BACKEND_PID $FRONTEND_PID; exit' INT
  wait
}

# ────────────────────────────────
# Main Execution Flow
# ────────────────────────────────
main() {
  test_supabase_connection || exit 1
  install_dependencies
  setup_environment

  if grep -q "a ajouter" .env; then
    echo -e "${YELLOW}⚠️  Warning: PayPal credentials are incomplete. Payment features will be disabled.${RESET}"
  fi

  echo -e "${GREEN}✅ Setup complete. Starting servers...${RESET}"
  start_servers
}

main
