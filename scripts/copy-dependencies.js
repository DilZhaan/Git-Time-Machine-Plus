/**
 * Copy webview dependencies to output directory
 * This ensures the toolkit and codicons are available in the packaged extension
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively copy directory
 */
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Dependencies to copy
 */
const dependencies = [
  {
    from: path.join('node_modules', '@vscode', 'webview-ui-toolkit', 'dist'),
    to: path.join('out', 'webview-toolkit'),
    description: 'VSCode Webview UI Toolkit'
  },
  {
    from: path.join('node_modules', '@vscode', 'codicons', 'dist'),
    to: path.join('out', 'codicons'),
    description: 'VSCode Codicons'
  }
];

console.log('📦 Copying webview dependencies...\n');

let success = true;

dependencies.forEach(dep => {
  const source = path.resolve(__dirname, '..', dep.from);
  const dest = path.resolve(__dirname, '..', dep.to);
  
  try {
    if (!fs.existsSync(source)) {
      console.error(`❌ Source not found: ${dep.from}`);
      success = false;
      return;
    }

    console.log(`📁 Copying ${dep.description}...`);
    console.log(`   From: ${dep.from}`);
    console.log(`   To:   ${dep.to}`);
    
    copyDir(source, dest);
    console.log(`✅ Successfully copied ${dep.description}\n`);
  } catch (error) {
    console.error(`❌ Failed to copy ${dep.description}:`, error.message);
    success = false;
  }
});

if (success) {
  console.log('✅ All webview dependencies copied successfully!');
  process.exit(0);
} else {
  console.error('\n❌ Some dependencies failed to copy');
  process.exit(1);
}
