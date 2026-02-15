# 🚀 Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Prerequisites

**Node.js & npm**
```bash
# Check if installed
node --version  # Should be v16 or higher
npm --version
```

**MetaMask**
- Install MetaMask browser extension from https://metamask.io

**Google Gemini API Key**
- Go to https://makersuite.google.com/app/apikey
- Sign in with Google account
- Click "Create API Key"
- Copy the key

### 2. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd academic-credential-verification-main

# Install all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
NODE_ENV=development
GEMINI_API_KEY=your-gemini-api-key
```

**Getting Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new
4. Copy the 16-character password

### 4. Start Services

**Terminal 1 - Hardhat Node:**
```bash
npx hardhat node
```
Keep this running. You'll see test accounts with private keys.

**Terminal 2 - Deploy Contract:**
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Copy the contract address from output.

Update `frontend/src/config.js`:
```javascript
contract: {
  address: 'YOUR_CONTRACT_ADDRESS_HERE',
  networkId: 1337,
  networkName: 'Local Hardhat Network'
},
```

Copy ABI:
```bash
cp artifacts/contracts/AcademicCredential.sol/AcademicCredential.json frontend/src/AcademicCredentialABI.json
```

**Terminal 3 - Backend Services:**
```bash
cd backend
npm start  # Email service on port 3001
```

**Terminal 4 - AI Verifier:**
```bash
cd backend
node certificate-verifier-ai.js  # AI verifier on port 3002
```

**Terminal 5 - Frontend:**
```bash
cd frontend
npm start  # React app on port 3000
```

### 5. Configure MetaMask

1. Open MetaMask
2. Add Network:
   - Network Name: Hardhat Local
   - RPC URL: http://localhost:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

3. Import Test Accounts:
   - Copy private keys from Hardhat node terminal
   - MetaMask → Import Account → Paste private key
   - Import at least 4 accounts (Admin, University, Student, Company)

### 6. Initialize System

1. **Connect as Admin** (Account #0)
   - Go to http://localhost:3000
   - Connect MetaMask
   - You should see Admin Dashboard

2. **Register University**
   - Admin Dashboard → Register University
   - Use Account #1 address
   - Name: "Test University"
   - Email: university@test.com

3. **Register Company**
   - Admin Dashboard → Register Company
   - Use Account #3 address
   - Name: "Test Company"
   - Email: company@test.com

4. **Register Student** (as University)
   - Disconnect MetaMask
   - Connect with Account #1 (University)
   - University Dashboard → Register Student
   - Use Account #2 address
   - Fill in student details

5. **Test the System**
   - Connect as Student (Account #2)
   - Upload a professional certificate
   - Watch AI verification in action!

## 🔧 Troubleshooting

### Contract Address Mismatch
```bash
# Redeploy contract
npx hardhat run scripts/deploy.js --network localhost

# Update config.js with new address
# Copy ABI again
cp artifacts/contracts/AcademicCredential.sol/AcademicCredential.json frontend/src/AcademicCredentialABI.json

# Restart frontend
```

### MetaMask Nonce Issues
- MetaMask → Settings → Advanced → Reset Account

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8545 | xargs kill -9  # Hardhat
```

### AI Verifier Not Working
- Check GEMINI_API_KEY in backend/.env
- Verify API key at https://makersuite.google.com/app/apikey
- Check backend/certificate-verifier-ai.js is running

## 📝 Test Accounts

From Hardhat node output:
- **Account #0** - Admin (has all permissions)
- **Account #1** - University
- **Account #2** - Student
- **Account #3** - Company

Each account has 10,000 ETH for testing.

## 🎯 Next Steps

1. Test certificate upload and AI verification
2. Test document sharing between student and company
3. Test university approval workflow for MEDIUM trust certificates
4. Explore all features in different roles

## 📞 Need Help?

- Check console logs in browser (F12)
- Check terminal outputs for errors
- Ensure all 5 terminals are running
- Verify MetaMask is connected to correct network
