🎓 Academic Credential Verification System
A blockchain-based platform for issuing, managing, and verifying academic credentials with AI-powered certificate verification.

✨ Features
Core Features
Blockchain-Based Verification - Immutable credential storage on Ethereum
Role-Based Access Control - Admin, University, Student, and Company roles
AI-Powered Certificate Verification - Automatic verification using Google Gemini Vision API
Smart Trust Levels - Auto-approve high-confidence certificates, manual review for medium confidence
Document Sharing - Secure certificate and grade sheet sharing with companies
Email OTP Verification - Secure student data updates with email confirmation
IPFS Storage - Decentralized file storage for certificates
AI Verification Features
QR Code Detection - Automatically detects and reads QR codes on certificates
OCR Text Extraction - Extracts text from certificate images
URL Verification - Visits verification URLs to cross-check authenticity
Intelligent Name Matching - Handles name variations (e.g., "M Navaneeth" vs "Navaneeth M")
Trust Level System:
HIGHEST/HIGH → Auto-approved, added to blockchain immediately
MEDIUM → Requires university approval
LOW/REJECTED → Auto-rejected
🏗️ Architecture
┌─────────────────┐
│   Frontend      │ React + Material-UI
│   (Port 3000)   │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
┌────────▼────────┐              ┌────────▼────────┐
│  Smart Contract │              │  Backend APIs   │
│  (Hardhat Node) │              │                 │
│  Port 8545      │              ├─────────────────┤
└─────────────────┘              │ Email Service   │
                                 │ (Port 3001)     │
                                 ├─────────────────┤
                                 │ AI Verifier     │
                                 │ (Port 3002)     │
                                 └─────────────────┘
🚀 Quick Start
Prerequisites
Node.js (v16 or higher)
npm or yarn
MetaMask browser extension
Google Gemini API key (free from https://makersuite.google.com/app/apikey)
Installation
Clone the repository
git clone <your-repo-url>
cd academic-credential-verification-main
Install dependencies
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
Configure environment variables
# Backend configuration
cd backend
cp .env.example .env
# Edit .env and add your credentials:
# - EMAIL_USER: Your Gmail address
# - EMAIL_PASS: Gmail app-specific password
# - GEMINI_API_KEY: Your Google Gemini API key
cd ..
Start the services
Option 1: Start all services at once

./START_SERVICES.sh
Option 2: Start services individually

Terminal 1 - Hardhat Node:

npx hardhat node
Terminal 2 - Deploy Contract:

npx hardhat run scripts/deploy.js --network localhost
# Copy the contract address and update frontend/src/config.js
Terminal 3 - Backend Services:

cd backend
npm start  # Email service
node certificate-verifier-ai.js  # AI verifier
Terminal 4 - Frontend:

cd frontend
npm start
Configure MetaMask
Network: Localhost 8545
Chain ID: 1337
Import test accounts from Hardhat node output
Access the application
Frontend: http://localhost:3000
Email Service: http://localhost:3001
AI Verifier: http://localhost:3002
📋 User Roles & Workflows
Admin
Register universities and companies
Approve/reject registration requests
Manage system-wide settings
University
Register students
Issue academic certificates and grade sheets
Edit student information (requires student email OTP confirmation)
Approve/reject professional certificates (MEDIUM trust level)
View and manage student records
Student
Upload professional certificates (auto-verified by AI)
View all certificates and grade sheets
Share documents with companies
Respond to company access requests
View verification status and feedback
Company
Request access to student documents
View shared certificates and grade sheets
Verify documents and provide feedback
Mark documents as "Verified" or "Need More Documents"
🤖 AI Certificate Verification
The system uses Google Gemini Vision API to automatically verify professional certificates:

Verification Process
Upload - Student uploads certificate (PDF/Image)
AI Analysis - Gemini extracts:
Recipient name
Course/certification name
Issuing organization
Verification URL
Issue date
Name Matching - Intelligent comparison with student's registered name
URL Verification - Visits verification URL to cross-check
Trust Level Assignment:
HIGHEST: URL verified + name found on page + 95%+ match
HIGH: URL verified + 95%+ name match
MEDIUM: 85-95% name match or URL exists but not accessible
LOW: 60-85% name match
REJECTED: <60% name match
Auto-Approval Logic
HIGHEST/HIGH → Uploaded to blockchain immediately with APPROVED status
MEDIUM → Sent to university for manual review
LOW/REJECTED → Cannot be uploaded, shows error message
🔧 Technology Stack
Frontend
React 18
Material-UI (MUI)
ethers.js v6
React Router
React Toastify
Backend
Node.js + Express
Nodemailer (Email service)
Google Generative AI (Gemini)
Tesseract.js (OCR)
Axios + Cheerio (URL verification)
Blockchain
Solidity
Hardhat
Ethereum (Local network)
IPFS (Decentralized storage)
📁 Project Structure
academic-credential-verification-main/
├── contracts/
│   └── AcademicCredential.sol       # Main smart contract
├── scripts/
│   ├── deploy.js                    # Deployment script
│   └── verify.js                    # Verification script
├── backend/
│   ├── server.js                    # Email OTP service
│   ├── certificate-verifier-ai.js   # AI verification service
│   └── .env.example                 # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── pages/                   # Page components
│   │   ├── context/                 # Blockchain context
│   │   ├── utils/                   # Utility functions
│   │   └── config.js                # Configuration
│   └── public/                      # Static assets
├── hardhat.config.js                # Hardhat configuration
├── package.json                     # Root dependencies
└── README.md                        # This file
🔐 Security Features
Blockchain Immutability - Credentials cannot be altered once issued
Role-Based Access Control - Strict permission management
Email OTP Verification - Secure student data updates
IPFS Storage - Decentralized and tamper-proof file storage
AI Verification - Reduces fraudulent certificate uploads
MetaMask Integration - Secure wallet-based authentication
🧪 Testing
# Run smart contract tests
npx hardhat test

# Run with coverage
npx hardhat coverage
📝 Smart Contract Functions
Admin Functions
registerUniversity(address, string, string)
registerVerifier(address, string, string)
approveRegistrationRequest(bytes32)
rejectRegistrationRequest(bytes32, string)
University Functions
registerStudent(address, string, string, string, string)
issueCertificate(...)
issueGradeSheet(...)
editStudentDetails(...)
approveNonAcademicCertificate(bytes32)
rejectNonAcademicCertificate(bytes32, string)
Student Functions
uploadNonAcademicCertificate(string, string, string) - PENDING status
uploadVerifiedNonAcademicCertificate(string, string, string) - APPROVED status
shareCertificateWithVerifier(address, bytes32)
respondToCertificateRequest(bytes32, bool, bytes32[], bytes32[])
Company Functions
requestCertificateAccess(address, string)
verifyDocument(address, bytes32, bool, string)
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📄 License
This project is licensed under the MIT License.

🙏 Acknowledgments
Google Gemini AI for certificate verification
OpenZeppelin for secure smart contract libraries
IPFS for decentralized storage
Hardhat for Ethereum development environment
📞 Support
For issues and questions, please open an issue on GitHub.

Note: This is a development version. For production deployment, ensure proper security audits and use mainnet or testnet instead of local Hardhat network.
