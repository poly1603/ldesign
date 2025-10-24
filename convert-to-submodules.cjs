#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const GITHUB_USER = 'poly1603';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_PREFIX = 'ldesign-';

// Directories to convert
const directories = [
  { path: 'packages/tabs', name: 'tabs' },
  { path: 'packages/menu', name: 'menu' },
  { path: 'tools/publisher', name: 'publisher' }
];

function createGitHubRepo(repoName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: repoName,
      private: false
    });

    const options = {
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Node.js'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          const result = JSON.parse(body);
          console.log(`✓ Created repo: ${repoName}`);
          resolve(result.clone_url);
        } else if (res.statusCode === 422 && body.includes('name already exists')) {
          const result = JSON.parse(body);
          console.log(`⚠ Repo already exists: ${repoName}, using existing repo`);
          resolve(`https://github.com/${GITHUB_USER}/${repoName}.git`);
        } else {
          console.error(`✗ Failed to create repo: ${repoName} (${res.statusCode})`);
          console.error(body);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`✗ Request error: ${e.message}`);
      resolve(null);
    });

    req.write(data);
    req.end();
  });
}

function exec(command, cwd = process.cwd()) {
  try {
    return execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.stderr || error.message}`);
  }
}

async function convertToSubmodule(dirPath, dirName) {
  const repoName = `${REPO_PREFIX}${dirName}`;
  const fullPath = path.resolve(dirPath);
  const tempPath = path.join(process.cwd(), `.temp-${dirName}`);

  console.log(`\n=== Processing ${dirPath} ===`);

  // 1. Create GitHub repository
  console.log('Step 1: Creating GitHub repository...');
  const cloneUrl = await createGitHubRepo(repoName);
  if (!cloneUrl) {
    console.log(`Skipping ${dirPath}`);
    return;
  }

  try {
    // 2. Copy directory to temp location (excluding node_modules)
    console.log('Step 2: Copying code to temp directory...');
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { recursive: true, force: true });
    }
    
    // Copy directory recursively, excluding node_modules and .git
    function copyRecursive(src, dest) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        const basename = path.basename(src);
        if (basename === 'node_modules' || basename === '.git') {
          console.log(`Skipping ${src}`);
          return;
        }
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        const files = fs.readdirSync(src);
        files.forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    copyRecursive(fullPath, tempPath);
    console.log('Copy complete');

    // 3. Initialize git in temp directory and push
    console.log('Step 3: Initializing Git and pushing...');
    exec('git init', tempPath);
    exec('git config user.email "action@github.com"', tempPath);
    exec('git config user.name "GitHub Action"', tempPath);
    exec('git add .', tempPath);
    exec('git commit -m "Initial commit from ldesign monorepo"', tempPath);
    exec('git branch -M main', tempPath);
    
    const authUrl = cloneUrl.replace('https://', `https://${GITHUB_USER}:${GITHUB_TOKEN}@`);
    exec(`git remote add origin ${authUrl}`, tempPath);
    exec('git push -u origin main --force', tempPath);
    
    console.log('✓ Push successful');

    // 4. Remove directory from main repo
    console.log('Step 4: Removing directory from main repo...');
    // Check if directory is tracked by git
    try {
      exec(`git ls-files --error-unmatch ${dirPath}`);
      // If tracked, use git rm
      exec(`git rm -rf ${dirPath}`);
      exec(`git commit -m "Remove ${dirPath} (converting to submodule)"`);
    } catch (e) {
      // Not tracked, just delete the directory
      console.log('Directory not tracked, removing directly...');
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    // 5. Add as submodule
    console.log('Step 5: Adding as submodule...');
    exec(`git submodule add ${cloneUrl} ${dirPath}`);
    exec(`git commit -m "Add ${dirPath} as submodule"`);

    // 6. Clean up temp directory
    console.log('Step 6: Cleaning up...');
    fs.rmSync(tempPath, { recursive: true, force: true });

    console.log(`✓ Completed ${dirPath}`);
  } catch (error) {
    console.error(`✗ Error processing ${dirPath}:`, error.message);
    // Clean up temp directory on error
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { recursive: true, force: true });
    }
  }
}

async function main() {
  console.log('Starting conversion to submodules...');
  console.log(`GitHub User: ${GITHUB_USER}`);
  console.log(`Repo Prefix: ${REPO_PREFIX}`);

  for (const dir of directories) {
    await convertToSubmodule(dir.path, dir.name);
  }

  console.log('\n=== All Done ===');
  console.log('Run the following command to check submodules:');
  console.log('  git submodule status');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
