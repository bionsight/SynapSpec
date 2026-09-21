# Deploy script from SynapSpec-dev to SynapSpec
# Usage: ./deploy.sh

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting SynapSpec deployment...${NC}"

# Check if current directory is SynapSpec-dev
CURRENT_DIR=$(basename "$PWD")
if [ "$CURRENT_DIR" != "SynapSpec-dev" ]; then
    echo -e "${RED}❌ Error: Please run this script from SynapSpec-dev directory.${NC}"
    echo "Current directory: $PWD"
    exit 1
fi

# Check if target directory exists
TARGET_DIR="../SynapSpec"
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}❌ Error: ../SynapSpec directory does not exist.${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Syncing files...${NC}"

# Sync files using rsync
rsync -av \
    --delete \
    --exclude='.git/' \
    --exclude='.gitignore' \
    --exclude='.idea/' \
    --exclude='.vscode/' \
    --exclude='node_modules/' \
    --exclude='_jekyll_cache/' \
    --exclude='.jekyll-cache/' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='deploy.sh' \
    --exclude='README.md' \
    --exclude='.DS_Store' \
    --exclude='.claude' \
    --exclude='Thumbs.db' \
    ./ "$TARGET_DIR/"

echo -e "${GREEN}✅ File synchronization completed!${NC}"

# Move to SynapSpec directory and perform git operations
echo -e "${YELLOW}📝 Committing and pushing to git...${NC}"

cd "$TARGET_DIR"

# Check if there are any changes
if [[ -n $(git status --porcelain) ]]; then
    # Stage all changes
    git add .

    # Generate commit message with current date/time
    COMMIT_MSG="Update website content - $(date '+%Y-%m-%d %H:%M')"
    git commit -m "$COMMIT_MSG"

    # Push to remote repository
    echo -e "${YELLOW}🌐 Pushing to remote repository...${NC}"
    git push origin main

    echo -e "${GREEN}🎉 Deployment completed!${NC}"
    echo -e "${GREEN}Commit message: $COMMIT_MSG${NC}"
else
    echo -e "${YELLOW}ℹ️  No changes detected, skipping commit.${NC}"
fi

echo -e "${GREEN}✨ All tasks completed successfully!${NC}"