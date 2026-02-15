// Frontend Configuration
// Updated: 2025-11-10 11:43 AM
export const CONFIG = {
  // Contract Configuration - V2 with Role-Based Access + Auto-Verified Certificates
  contract: {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    networkId: 1337,
    networkName: 'Local Hardhat Network'
  },
  
  // Application Configuration
  app: {
    title: 'Academic Credential Verification',
    description: 'Blockchain-based academic credential verification system',
    version: '1.0.0'
  },
  
  // Network Configuration
  networks: {
    localhost: {
      chainId: 1337,
      name: 'Local Hardhat Network',
      rpcUrl: 'http://localhost:8545'
    }
  }
};
