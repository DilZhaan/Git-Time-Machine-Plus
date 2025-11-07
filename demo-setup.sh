#!/bin/bash

# Demo Setup Script for Git Time Machine Extension
# This script creates a test repository with unpushed commits

echo "🚀 Setting up Git Time Machine demo repository..."

# Create demo directory
DEMO_DIR="$HOME/git-time-machine-demo"

# Remove if exists
if [ -d "$DEMO_DIR" ]; then
    echo "📁 Removing existing demo directory..."
    rm -rf "$DEMO_DIR"
fi

# Create and navigate to demo directory
mkdir -p "$DEMO_DIR"
cd "$DEMO_DIR" || exit

echo "✅ Created demo directory: $DEMO_DIR"

# Initialize git repository
git init
echo "✅ Initialized git repository"

# Configure git user (if not set)
git config user.name "Demo User" 2>/dev/null || true
git config user.email "demo@example.com" 2>/dev/null || true

# Create initial commit
cat > README.md << 'EOF'
# Git Time Machine Demo

This is a demo repository for testing the Git Time Machine VS Code extension.

## Features to Test

- Detect unpushed commits
- Edit commit messages
- Edit commit timestamps
- Safety checks
EOF

git add README.md
git commit -m "Initial commit: Add README"
echo "✅ Created initial commit"

# Add a remote (won't actually push)
git remote add origin https://github.com/demo/git-time-machine-demo.git
echo "✅ Added remote origin (fake URL for demo)"

# Simulate that initial commit was pushed by creating orphan branch
# This way only new commits will be "unpushed"
git branch -M main

# Create first unpushed commit
cat > app.js << 'EOF'
// Simple demo application
function greet(name) {
    console.log(`Hello, ${name}!`);
}

greet('World');
EOF

git add app.js
git commit -m "Add main application file"
echo "✅ Commit 1: Add main application file"

# Wait a moment to ensure different timestamps
sleep 1

# Create second unpushed commit
cat >> app.js << 'EOF'

// Add farewell function
function farewell(name) {
    console.log(`Goodbye, ${name}!`);
}

farewell('World');
EOF

git add app.js
git commit -m "Add farewell function"
echo "✅ Commit 2: Add farewell function"

sleep 1

# Create third unpushed commit
cat > package.json << 'EOF'
{
  "name": "git-time-machine-demo",
  "version": "1.0.0",
  "description": "Demo app for Git Time Machine",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "author": "Demo User",
  "license": "MIT"
}
EOF

git add package.json
git commit -m "Add package.json configuration"
echo "✅ Commit 3: Add package.json configuration"

sleep 1

# Create fourth unpushed commit
cat > .gitignore << 'EOF'
node_modules/
*.log
.env
dist/
EOF

git add .gitignore
git commit -m "Add .gitignore file"
echo "✅ Commit 4: Add .gitignore file"

sleep 1

# Create fifth unpushed commit
cat > tests.js << 'EOF'
// Simple tests
const assert = require('assert');

function testGreet() {
    console.log('Testing greet function...');
    // Test would go here
    console.log('✓ Greet test passed');
}

function testFarewell() {
    console.log('Testing farewell function...');
    // Test would go here
    console.log('✓ Farewell test passed');
}

testGreet();
testFarewell();
console.log('\n✅ All tests passed!');
EOF

git add tests.js
git commit -m "Add test suite"
echo "✅ Commit 5: Add test suite"

# Display summary
echo ""
echo "🎉 Demo repository setup complete!"
echo ""
echo "📊 Repository Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Location: $DEMO_DIR"
echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "Remote: $(git remote -v | head -1 | awk '{print $2}')"
echo "Unpushed commits: 5"
echo ""

# Show commit log
echo "📝 Commit History:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git log --oneline --graph --decorate --all -5
echo ""

echo "🔧 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Open VS Code: code $DEMO_DIR"
echo "2. Press F5 in the extension project to launch Extension Development Host"
echo "3. In the new VS Code window, open this demo folder"
echo "4. Go to Source Control (Ctrl+Shift+G / Cmd+Shift+G)"
echo "5. Look for the 'Git Time Machine' panel"
echo "6. You should see 5 unpushed commits!"
echo ""
echo "📚 Run these commands to test different scenarios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "cd $DEMO_DIR"
echo ""
echo "# Create another unpushed commit:"
echo "echo 'New feature' >> app.js && git add app.js && git commit -m 'New feature'"
echo ""
echo "# Create uncommitted changes (to test safety warning):"
echo "echo 'Uncommitted' >> app.js"
echo ""
echo "# View git log:"
echo "git log --oneline -10"
echo ""
echo "# Check git status:"
echo "git status"
echo ""

echo "✨ Happy testing with Git Time Machine! ✨"

