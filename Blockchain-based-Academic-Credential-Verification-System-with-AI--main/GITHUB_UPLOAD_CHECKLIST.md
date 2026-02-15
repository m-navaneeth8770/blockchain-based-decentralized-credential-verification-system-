# ✅ GitHub Upload Checklist

## Files to Upload (Already Configured in .gitignore)

### ✅ Include These:
- ✅ All source code files
- ✅ `contracts/` - Smart contracts
- ✅ `scripts/` - Deployment scripts
- ✅ `frontend/src/` - React application
- ✅ `backend/` - Backend services (except .env)
- ✅ `package.json` files
- ✅ `hardhat.config.js`
- ✅ `README.md`
- ✅ `SETUP_GUIDE.md`
- ✅ `.gitignore`
- ✅ `backend/.env.example` - Template for environment variables

### ❌ DO NOT Upload (Excluded by .gitignore):
- ❌ `node_modules/` - Dependencies (users will install)
- ❌ `.env` files - Contains sensitive API keys and passwords
- ❌ `backend/.env` - Email credentials and API keys
- ❌ `artifacts/` - Compiled contracts (generated on build)
- ❌ `cache/` - Build cache
- ❌ `.DS_Store` - Mac system files
- ❌ `build/` - Production builds

## Before Uploading

### 1. Remove Sensitive Data
```bash
# Check if .env is in .gitignore
cat .gitignore | grep .env

# Make sure backend/.env exists but is ignored
ls -la backend/.env
```

### 2. Clean Up
```bash
# Remove unnecessary files
rm -rf node_modules/
rm -rf frontend/node_modules/
rm -rf backend/node_modules/
rm -rf artifacts/
rm -rf cache/
```

### 3. Test .gitignore
```bash
# Check what will be committed
git status

# Should NOT see:
# - node_modules/
# - .env files
# - artifacts/
# - cache/
```

## Upload Steps

### Option 1: Using Git Command Line

```bash
# Initialize git (if not already)
git init

# Add all files (respects .gitignore)
git add .

# Check what's being added
git status

# Commit
git commit -m "Initial commit: Academic Credential Verification System with AI"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### Option 2: Using GitHub Desktop

1. Open GitHub Desktop
2. File → Add Local Repository
3. Select your project folder
4. Review changes (should not include node_modules, .env, etc.)
5. Commit to main
6. Publish repository

### Option 3: Using VS Code

1. Open project in VS Code
2. Source Control panel (Ctrl+Shift+G)
3. Initialize Repository
4. Stage changes (check what's included)
5. Commit
6. Publish to GitHub

## After Upload

### 1. Add Repository Description
```
Blockchain-based academic credential verification system with AI-powered certificate validation using Google Gemini Vision API
```

### 2. Add Topics/Tags
- blockchain
- ethereum
- solidity
- react
- ai
- certificate-verification
- hardhat
- ipfs
- gemini-ai
- education

### 3. Update README
- Replace `<your-repo-url>` with actual GitHub URL
- Add screenshots if desired
- Add demo video link if available

### 4. Create .env.example Reminder
Add to README:
```markdown
## ⚠️ Important: Environment Variables

Before running the project, you MUST:
1. Copy `backend/.env.example` to `backend/.env`
2. Add your own credentials:
   - Gmail email and app password
   - Google Gemini API key
3. Never commit the `.env` file to GitHub
```

## Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] No API keys in code
- [ ] No email passwords in code
- [ ] No private keys in code
- [ ] `.env.example` has placeholder values only
- [ ] README mentions security setup

## What Users Will Need to Do

After cloning your repository, users will need to:

1. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

2. **Configure environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with their own credentials
   ```

3. **Follow SETUP_GUIDE.md**

## Repository Structure on GitHub

```
your-repo/
├── README.md                    ← Main documentation
├── SETUP_GUIDE.md              ← Detailed setup instructions
├── .gitignore                  ← Excludes sensitive files
├── package.json                ← Root dependencies
├── hardhat.config.js           ← Blockchain config
├── contracts/                  ← Smart contracts
├── scripts/                    ← Deployment scripts
├── backend/
│   ├── .env.example           ← Template (no secrets!)
│   ├── server.js              ← Email service
│   ├── certificate-verifier-ai.js
│   └── package.json
└── frontend/
    ├── src/                   ← React app
    ├── public/
    └── package.json
```

## Final Check

Before pushing:
```bash
# Verify .env is not tracked
git ls-files | grep .env
# Should return nothing or only .env.example

# Verify node_modules is not tracked
git ls-files | grep node_modules
# Should return nothing

# Check file count (should be reasonable, not thousands)
git ls-files | wc -l
# Should be < 500 files
```

## 🎉 Ready to Upload!

If all checks pass, you're ready to upload to GitHub!

```bash
git add .
git commit -m "Initial commit: Academic Credential Verification System"
git push -u origin main
```
