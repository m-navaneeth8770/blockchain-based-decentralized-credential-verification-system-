# 🦊 MetaMask Setup Guide - Test Wallets

## 📋 How to Add Test Wallet Addresses to MetaMask

Follow these steps to import Hardhat test accounts into MetaMask and test each dashboard.

---

## 🔧 Step 1: Add Localhost Network to MetaMask

### **Method 1: Automatic (When Connecting)**
1. Open your app at http://localhost:3000
2. Click "Sign In" button
3. MetaMask will prompt to add the network
4. Click "Approve" then "Switch Network"

### **Method 2: Manual Setup**
1. Open MetaMask
2. Click the network dropdown (top center)
3. Click "Add Network" or "Add a network manually"
4. Enter these details:
   ```
   Network Name: Hardhat Local
   New RPC URL: http://localhost:8545
   Chain ID: 1337
   Currency Symbol: ETH
   ```
5. Click "Save"
6. Switch to "Hardhat Local" network

---

## 👤 Step 2: Import Test Accounts

### **Account #0 - Admin (Already Active)**
This is usually the default account MetaMask creates, but if you need to import it:

```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Role: Admin
Balance: 10,000 ETH
```

**How to Import:**
1. Open MetaMask
2. Click the account icon (top right)
3. Click "Import Account"
4. Select "Private Key"
5. Paste: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
6. Click "Import"
7. Rename to "Admin" (click account name → Edit → Enter "Admin")

---

### **Account #1 - University**

```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Role: University (Register via Admin first)
Balance: 10,000 ETH
```

**How to Import:**
1. Click account icon → "Import Account"
2. Paste: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
3. Click "Import"
4. Rename to "University - MIT"

---

### **Account #2 - Student**

```
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Role: Student (Register via University)
Balance: 10,000 ETH
```

**How to Import:**
1. Click account icon → "Import Account"
2. Paste: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
3. Click "Import"
4. Rename to "Student - John Doe"

---

### **Account #3 - Verifier**

```
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Address: 0x90f79bf6eb2c4f870365e785982e1f101e93b906
Role: Verifier (Register via Admin)
Balance: 10,000 ETH
```

**How to Import:**
1. Click account icon → "Import Account"
2. Paste: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`
3. Click "Import"
4. Rename to "Verifier - Google"

---

## 🎯 Step 3: Complete Testing Workflow

### **Phase 1: Admin Setup**

1. **Switch to Admin Account**
   - Open MetaMask
   - Select "Admin" account
   - Refresh the page

2. **Register University**
   - You'll see Admin Dashboard
   - Click "Register University"
   - Fill in:
     ```
     Wallet Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
     Name: MIT University
     Registration Number: MIT-2024-001
     Email: admin@mit.edu
     ```
   - Click "Register University"
   - Approve transaction in MetaMask

3. **Register Verifier**
   - Click "Register Verifier"
   - Fill in:
     ```
     Wallet Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
     Company Name: Google Inc.
     Registration Number: GOOGLE-HR-2024
     Email: hr@google.com
     ```
   - Click "Register Verifier"
   - Approve transaction

---

### **Phase 2: University Operations**

1. **Switch to University Account**
   - Open MetaMask
   - Select "University - MIT" account
   - Refresh the page
   - You'll be redirected to University Dashboard

2. **Register a Student**
   - Go to "Students" tab
   - Click "Add Student"
   - Fill in:
     ```
     Wallet Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
     Name: John Doe
     Email: john.doe@mit.edu
     Student ID: MIT2024001
     Year: 2024
     Branch: Computer Science
     ```
   - Click "Register Student"
   - Approve transaction

3. **Issue Academic Certificate** (Optional)
   - Go to "Documents" tab
   - Select student
   - Fill certificate details
   - Issue certificate

---

### **Phase 3: Student Operations**

1. **Switch to Student Account**
   - Open MetaMask
   - Select "Student - John Doe" account
   - Refresh the page
   - You'll see Student Dashboard

2. **View Your Profile**
   - See your stats (Total Documents, Verified, APAAR ID)
   - View your certificates (if any issued)

3. **Upload Non-Academic Certificate**
   - Click "Upload Document" button
   - Fill in:
     ```
     Certificate Name: Google Internship 2024
     Certificate Hash: INTERN-GOOGLE-2024-001
     Additional Info: {"company": "Google", "duration": "3 months"}
     ```
   - Click "Upload"
   - Approve transaction

---

### **Phase 4: Verifier Operations**

1. **Switch to Verifier Account**
   - Open MetaMask
   - Select "Verifier - Google" account
   - Refresh the page
   - You'll see Verifier Dashboard

2. **Search for Student**
   - Enter student wallet address in search:
     ```
     0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
     ```
   - Click "Search"

3. **Request Certificates**
   - Click "Request" button
   - Enter message
   - Send request

---

## 🔄 Quick Account Switching

### **Fast Method:**
1. Click MetaMask extension
2. Click account name at top
3. Select the account you want
4. Refresh the browser page
5. You'll be auto-redirected to the correct dashboard

### **Account Summary:**
```
Admin       → Admin Dashboard
University  → University Dashboard  
Student     → Student Dashboard
Verifier    → Verifier Dashboard
```

---

## 💡 Pro Tips

### **1. Label Your Accounts**
After importing, rename each account in MetaMask:
- Click account name
- Click "Edit"
- Enter descriptive name
- Save

### **2. Check Network**
Always ensure you're on "Hardhat Local" network (Chain ID: 1337)

### **3. Reset Account if Stuck**
If transactions fail:
- MetaMask → Settings → Advanced
- Click "Reset Account"
- This clears transaction history

### **4. Check Balance**
All test accounts have 10,000 ETH
- If balance is 0, you're on wrong network
- Switch to "Hardhat Local"

### **5. Transaction Confirmation**
- Always check MetaMask popup
- Review transaction details
- Click "Confirm"
- Wait for success message

---

## 🎨 Visual Guide

### **Importing Account:**
```
MetaMask Icon (top right)
    ↓
"Import Account"
    ↓
Select "Private Key"
    ↓
Paste Private Key
    ↓
Click "Import"
    ↓
Rename Account
```

### **Switching Accounts:**
```
MetaMask Icon
    ↓
Click Account Name (top)
    ↓
Select Different Account
    ↓
Refresh Browser Page
    ↓
Auto-redirect to Dashboard
```

---

## 📊 Testing Checklist

### **Admin Dashboard** ✅
- [ ] Import Admin account
- [ ] Connect wallet
- [ ] Register university
- [ ] Register verifier
- [ ] View registered entities

### **University Dashboard** ✅
- [ ] Import University account
- [ ] Switch to University account
- [ ] Register student
- [ ] View student list
- [ ] Filter by year/branch
- [ ] Issue certificate (optional)

### **Student Dashboard** ✅
- [ ] Import Student account
- [ ] Switch to Student account
- [ ] View profile
- [ ] View certificates
- [ ] Upload non-academic certificate
- [ ] See APAAR ID

### **Verifier Dashboard** ✅
- [ ] Import Verifier account
- [ ] Switch to Verifier account
- [ ] Search for student
- [ ] Request certificates
- [ ] View results

---

## ⚠️ Common Issues

### **Issue: "Account Not Registered"**
**Solution:** 
- Make sure you registered the account via Admin (for University/Verifier)
- Make sure you registered via University (for Student)

### **Issue: "Wrong Network"**
**Solution:**
- Check you're on "Hardhat Local" (Chain ID: 1337)
- Switch network in MetaMask

### **Issue: "Transaction Failed"**
**Solution:**
- Reset MetaMask account
- Check you have ETH balance
- Ensure blockchain node is running

### **Issue: "Cannot Connect Wallet"**
**Solution:**
- Refresh the page
- Disconnect and reconnect
- Check MetaMask is unlocked

---

## 🎯 Quick Reference Card

### **Copy-Paste Private Keys:**

```bash
# Admin (Account #0)
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# University (Account #1)
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

# Student (Account #2)
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

# Verifier (Account #3)
0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

### **Copy-Paste Addresses:**

```bash
# Admin
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# University
0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# Student
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

# Verifier
0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

---

## 🎉 You're Ready!

After importing all 4 accounts, you can:
- ✅ Test all dashboards
- ✅ Switch between roles easily
- ✅ Complete full workflow
- ✅ Verify all functionality

**Start with Admin account and work through the phases above!** 🚀

---

**⚠️ IMPORTANT SECURITY NOTE:**
These are TEST accounts for LOCAL development only. 
**NEVER use these private keys on mainnet or with real funds!**
They are publicly known and anyone can access them.

---

**Need Help?** 
- Check the browser console (F12) for errors
- Verify all services are running
- See `SYSTEM_READY.md` for troubleshooting
