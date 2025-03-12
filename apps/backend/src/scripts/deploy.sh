#!/bin/bash

# DevLaunch Backend Deployment Script
# This script is used to deploy the backend service to a server

# Display help information
function show_help {
  echo "DevLaunch Backend Deployment Script"
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -e, --env ENV     Deployment environment (development|staging|production)"
  echo "  -h, --help        Display help information"
  exit 0
}

# Default environment is development
ENV="development"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -e|--env)
      ENV="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# Set environment variable file
ENV_FILE=".env.$ENV"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment variable file $ENV_FILE does not exist"
  exit 1
fi

# Start deployment
echo "Starting deployment of DevLaunch backend to $ENV environment"

# Load environment variables
source "$ENV_FILE"

# Build the application
echo "Building the application..."
npm run build

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npm run migrate
fi

# Deploying to server
echo "Deploying to server..."

# Set up deployment target based on environment
if [ "$ENV" = "production" ]; then
  DEPLOY_TARGET="$PROD_SERVER"
elif [ "$ENV" = "staging" ]; then
  DEPLOY_TARGET="$STAGING_SERVER"
else
  DEPLOY_TARGET="$DEV_SERVER"
fi

# Deploy files to server
echo "Deploying files to $DEPLOY_TARGET..."
rsync -avz --exclude 'node_modules' --exclude '.git' . "$DEPLOY_TARGET"

# Restart services on server
echo "Restarting services..."
ssh "$DEPLOY_USER"@"$DEPLOY_HOST" "cd $DEPLOY_PATH && npm install && pm2 restart devlaunch-backend"

echo "Deployment completed successfully!"
exit 0 