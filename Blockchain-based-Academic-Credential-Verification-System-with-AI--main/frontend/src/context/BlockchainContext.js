import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { CONFIG } from '../config';
import AcademicCredentialArtifact from '../AcademicCredentialABI.json';

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin', 'university', 'student', 'verifier', null
  const [userProfile, setUserProfile] = useState(null);

  const CONTRACT_ADDRESS = CONFIG.contract.address;
  const CONTRACT_ABI = AcademicCredentialArtifact.abi;
  
  console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
  console.log('CONTRACT_ABI length:', CONTRACT_ABI?.length);

  useEffect(() => {
    initializeBlockchain();
  }, []);

  const initializeBlockchain = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          await connectWallet();
        }

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      } else {
        toast.error('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error initializing blockchain:', error);
      toast.error('Failed to initialize blockchain connection');
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Check network
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.chainId.toString(), network.name);
      
      // Check if we're on the correct network
      if (network.chainId.toString() !== '1337') {
        toast.error(`Wrong network! Please switch to Hardhat Local (Chain ID: 1337). Currently on Chain ID: ${network.chainId}`);
        
        // Try to switch network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // 1337 in hex
          });
          toast.info('Switched to Hardhat Local. Please reconnect.');
          setIsLoading(false);
          return;
        } catch (switchError) {
          // Network doesn't exist, try to add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x539',
                  chainName: 'Hardhat Local',
                  rpcUrls: ['http://127.0.0.1:8545'],
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                  }
                }]
              });
              toast.success('Hardhat Local network added! Please reconnect.');
            } catch (addError) {
              toast.error('Failed to add Hardhat Local network');
            }
          }
        }
        setIsLoading(false);
        return;
      }
      
      // Check if contract exists
      const code = await provider.getCode(CONTRACT_ADDRESS);
      console.log('Contract code at', CONTRACT_ADDRESS, ':', code.substring(0, 10) + '... (length:', code.length, ')');
      
      if (code === '0x') {
        toast.error('Contract not deployed at this address!');
        setIsLoading(false);
        return;
      }
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Determine user role
      await determineUserRole(contract, accounts[0]);

      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const determineUserRole = async (contract, address) => {
    try {
      console.log('Determining role for address:', address);
      
      // Check if admin
      const owner = await contract.owner();
      console.log('Contract owner:', owner);
      if (owner.toLowerCase() === address.toLowerCase()) {
        console.log('User is admin');
        setUserRole('admin');
        return;
      }

      // Check if university
      const university = await contract.universities(address);
      console.log('University check:', university);
      if (university.isActive) {
        console.log('User is university');
        setUserRole('university');
        setUserProfile(university);
        return;
      }

      // Check if verifier
      const verifier = await contract.verifiers(address);
      console.log('Verifier check:', verifier);
      if (verifier.isActive) {
        console.log('User is verifier');
        setUserRole('verifier');
        setUserProfile(verifier);
        return;
      }

      // Check if student
      const student = await contract.students(address);
      console.log('Student check:', student);
      if (student.isActive) {
        console.log('User is student');
        setUserRole('student');
        setUserProfile(student);
        return;
      }

      console.log('No role found for user');
      setUserRole(null);
    } catch (error) {
      console.error('Error determining user role:', error);
      setUserRole(null);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      if (contract) {
        await determineUserRole(contract, accounts[0]);
      }
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
    setUserRole(null);
    setUserProfile(null);
    toast.info('Wallet disconnected');
  };

  // Admin Functions
  const registerUniversity = async (address, name, regNumber, email) => {
    try {
      const tx = await contract.registerUniversity(address, name, regNumber, email);
      await tx.wait();
      toast.success('University registered successfully');
      return tx;
    } catch (error) {
      console.error('Error registering university:', error);
      toast.error('Failed to register university');
      throw error;
    }
  };

  const registerVerifier = async (address, companyName, regNumber, email) => {
    try {
      const tx = await contract.registerVerifier(address, companyName, regNumber, email);
      await tx.wait();
      toast.success('Verifier registered successfully');
      return tx;
    } catch (error) {
      console.error('Error registering verifier:', error);
      toast.error('Failed to register verifier');
      throw error;
    }
  };

  const getAllUniversities = async () => {
    try {
      const addresses = await contract.getAllUniversities();
      const universities = [];
      for (let addr of addresses) {
        const uni = await contract.universities(addr);
        universities.push({ address: addr, ...uni });
      }
      return universities;
    } catch (error) {
      console.error('Error fetching universities:', error);
      return [];
    }
  };

  const getAllVerifiers = async () => {
    try {
      const addresses = await contract.getAllVerifiers();
      const verifiers = [];
      for (let addr of addresses) {
        const ver = await contract.verifiers(addr);
        verifiers.push({
          address: addr,
          companyName: ver.companyName || ver[0],
          registrationNumber: ver.registrationNumber || ver[1],
          contactEmail: ver.contactEmail || ver[2],
          walletAddress: ver.walletAddress || ver[3],
          isActive: ver.isActive !== undefined ? ver.isActive : ver[4],
          registeredAt: ver.registeredAt || ver[5],
          ipfsHash: ver.ipfsHash || ver[6],
        });
      }
      return verifiers;
    } catch (error) {
      console.error('Error fetching verifiers:', error);
      return [];
    }
  };

  // University Functions
  const registerStudent = async (address, name, email, studentId, apaarId, year, branch) => {
    try {
      const tx = await contract.registerStudent(address, name, email, studentId, apaarId, year, branch);
      await tx.wait();
      toast.success('Student registered successfully');
      return tx;
    } catch (error) {
      console.error('Error registering student:', error);
      toast.error('Failed to register student');
      throw error;
    }
  };

  const updateStudentDetails = async (address, name, email, studentId, branch, year) => {
    try {
      const tx = await contract.updateStudentDetails(address, name, email, studentId, branch, year);
      await tx.wait();
      toast.success('Student details updated successfully');
      return tx;
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student details');
      throw error;
    }
  };

  const issueAcademicCertificate = async (studentAddress, certHash, certName, degreeType, field, gradDate, metadata) => {
    try {
      const tx = await contract.issueAcademicCertificate(
        studentAddress, certHash, certName, degreeType, field, gradDate, metadata
      );
      await tx.wait();
      toast.success('Certificate issued successfully');
      return tx;
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error('Failed to issue certificate');
      throw error;
    }
  };

  const getUniversityStudents = async (universityAddress) => {
    try {
      const addresses = await contract.getUniversityStudents(universityAddress);
      const students = [];
      for (let addr of addresses) {
        const student = await contract.students(addr);
        students.push({
          address: addr,
          name: student.name || student[0],
          email: student.email || student[1],
          studentId: student.studentId || student[2],
          apaarId: student.apaarId || student[3],
          walletAddress: student.walletAddress || student[4],
          universityAddress: student.universityAddress || student[5],
          yearOfJoining: student.yearOfJoining || student[6],
          branch: student.branch || student[7],
          isActive: student.isActive !== undefined ? student.isActive : student[8],
          registeredAt: student.registeredAt || student[9],
          ipfsHash: student.ipfsHash || student[10],
        });
      }
      return students;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  const approveNonAcademicCertificate = async (certHash) => {
    try {
      const tx = await contract.approveNonAcademicCertificate(certHash);
      await tx.wait();
      toast.success('Certificate approved');
      return tx;
    } catch (error) {
      console.error('Error approving certificate:', error);
      toast.error('Failed to approve certificate');
      throw error;
    }
  };

  const rejectNonAcademicCertificate = async (certHash) => {
    try {
      const tx = await contract.rejectNonAcademicCertificate(certHash);
      await tx.wait();
      toast.success('Certificate rejected');
      return tx;
    } catch (error) {
      console.error('Error rejecting certificate:', error);
      toast.error('Failed to reject certificate');
      throw error;
    }
  };

  // Student Functions
  const uploadNonAcademicCertificate = async (certHash, certName, metadata) => {
    try {
      const tx = await contract.uploadNonAcademicCertificate(certHash, certName, metadata);
      await tx.wait();
      toast.success('Certificate uploaded for verification');
      return tx;
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast.error('Failed to upload certificate');
      throw error;
    }
  };

  // Upload auto-verified non-academic certificate (HIGH/HIGHEST trust)
  const uploadVerifiedNonAcademicCertificate = async (certHash, certName, metadata) => {
    try {
      const tx = await contract.uploadVerifiedNonAcademicCertificate(certHash, certName, metadata);
      await tx.wait();
      toast.success('Certificate verified and added to your profile!');
      return tx;
    } catch (error) {
      console.error('Error uploading verified certificate:', error);
      toast.error('Failed to upload certificate');
      throw error;
    }
  };

  const getStudentCertificates = async (studentAddress) => {
    try {
      const hashes = await contract.getStudentCertificates(studentAddress);
      const certificates = [];
      for (let hash of hashes) {
        const cert = await contract.getCertificate(hash);
        console.log('Raw certificate from contract:', cert);
        certificates.push({ 
          hash,
          certificateHash: cert.certificateHash || cert[0],
          certificateName: cert.certificateName || cert[1],
          studentAddress: cert.studentAddress || cert[2],
          issuedBy: cert.issuedBy || cert[3],
          certificateType: cert.certificateType !== undefined ? Number(cert.certificateType) : Number(cert[4]),
          status: cert.status !== undefined ? Number(cert.status) : Number(cert[5]),
          issueDate: cert.issueDate || cert[6],
          graduationDate: cert.graduationDate || cert[7],
          degreeType: cert.degreeType || cert[8],
          fieldOfStudy: cert.fieldOfStudy || cert[9],
          isRevoked: cert.isRevoked !== undefined ? cert.isRevoked : cert[10],
          metadata: cert.metadata || cert[11],
          ipfsHash: cert.ipfsHash || cert[12],
        });
      }
      console.log('Processed certificates:', certificates);
      return certificates;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  };

  const shareCertificateWithVerifier = async (verifierAddress, certHash) => {
    try {
      const tx = await contract.shareCertificateWithVerifier(verifierAddress, certHash);
      await tx.wait();
      toast.success('Certificate shared with verifier');
      return tx;
    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast.error('Failed to share certificate');
      throw error;
    }
  };

  const getStudentRequests = async (studentAddress) => {
    try {
      const hashes = await contract.getStudentRequests(studentAddress);
      const requests = [];
      for (let hash of hashes) {
        const req = await contract.certificateRequests(hash);
        console.log('Raw request from contract:', req);
        
        // Fetch company/verifier information
        const verifier = await contract.verifiers(req.verifierAddress);
        
        // Explicitly extract boolean values
        const isApproved = req.isApproved || req[3] || false;
        const isRejected = req.isRejected || req[4] || false;
        
        console.log('Parsed values - isApproved:', isApproved, 'isRejected:', isRejected);
        
        requests.push({ 
          hash, 
          verifierAddress: req.verifierAddress || req[0],
          studentAddress: req.studentAddress || req[1],
          message: req.message || req[2],
          isApproved: isApproved,
          isRejected: isRejected,
          requestedAt: req.requestedAt || req[5],
          respondedAt: req.respondedAt || req[6],
          companyName: verifier.companyName || verifier[0] || 'Company',
          // Add status flags for easier filtering
          isPending: !isApproved && !isRejected,
        });
      }
      return requests;
    } catch (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
  };

  const respondToCertificateRequest = async (requestHash, approve, certHashes, gradeSheetHashes = []) => {
    try {
      const tx = await contract.respondToCertificateRequest(requestHash, approve, certHashes, gradeSheetHashes);
      await tx.wait();
      toast.success(approve ? 'Request approved and documents shared' : 'Request rejected');
      return tx;
    } catch (error) {
      console.error('Error responding to request:', error);
      
      // Check for specific error messages
      if (error.message && error.message.includes('Request already responded')) {
        toast.error('This request has already been responded to');
      } else if (error.message && error.message.includes('Only student can respond')) {
        toast.error('Only the student can respond to this request');
      } else {
        toast.error('Failed to respond to request');
      }
      throw error;
    }
  };

  // Verifier Functions
  const requestCertificates = async (studentAddress, message) => {
    try {
      const tx = await contract.requestCertificates(studentAddress, message);
      await tx.wait();
      toast.success('Certificate request sent');
      return tx;
    } catch (error) {
      console.error('Error requesting certificates:', error);
      toast.error('Failed to request certificates');
      throw error;
    }
  };

  const getSharedCertificates = async (studentAddress, verifierAddress) => {
    try {
      const hashes = await contract.getSharedCertificates(studentAddress, verifierAddress);
      const certificates = [];
      for (let hash of hashes) {
        const cert = await contract.getCertificate(hash);
        certificates.push({ hash, ...cert });
      }
      return certificates;
    } catch (error) {
      console.error('Error fetching shared certificates:', error);
      return [];
    }
  };

  const getAllStudents = async () => {
    try {
      const addresses = await contract.getAllStudents();
      const students = [];
      for (let addr of addresses) {
        const student = await contract.students(addr);
        students.push({
          address: addr,
          name: student.name || student[0],
          email: student.email || student[1],
          studentId: student.studentId || student[2],
          apaarId: student.apaarId || student[3],
          walletAddress: student.walletAddress || student[4],
          universityAddress: student.universityAddress || student[5],
          yearOfJoining: student.yearOfJoining || student[6],
          branch: student.branch || student[7],
          isActive: student.isActive !== undefined ? student.isActive : student[8],
          registeredAt: student.registeredAt || student[9],
          ipfsHash: student.ipfsHash || student[10],
        });
      }
      return students;
    } catch (error) {
      console.error('Error fetching all students:', error);
      return [];
    }
  };

  // Grade Sheet Functions
  const uploadGradeSheetToBlockchain = async (studentAddress, ipfsHash, semester, academicYear) => {
    try {
      const tx = await contract.uploadGradeSheet(studentAddress, ipfsHash, semester, academicYear);
      await tx.wait();
      toast.success('Grade sheet uploaded successfully');
      return tx;
    } catch (error) {
      console.error('Error uploading grade sheet:', error);
      toast.error('Failed to upload grade sheet');
      throw error;
    }
  };

  const getStudentGradeSheets = async (studentAddress) => {
    try {
      const hashes = await contract.getStudentGradeSheets(studentAddress);
      const gradeSheets = [];
      for (let hash of hashes) {
        const sheet = await contract.gradeSheets(hash);
        console.log('Raw grade sheet from contract:', sheet);
        gradeSheets.push({ 
          hash,
          certificateHash: sheet.certificateHash || sheet[0],
          ipfsHash: sheet.ipfsHash || sheet[1],
          studentAddress: sheet.studentAddress || sheet[2],
          uploadedBy: sheet.uploadedBy || sheet[3],
          uploadDate: sheet.uploadDate || sheet[4],
          semester: sheet.semester || sheet[5],
          academicYear: sheet.academicYear || sheet[6],
          isVisible: sheet.isVisible !== undefined ? sheet.isVisible : sheet[7],
        });
      }
      console.log('Processed grade sheets:', gradeSheets);
      return gradeSheets;
    } catch (error) {
      console.error('Error fetching grade sheets:', error);
      return [];
    }
  };

  // Company Approval Functions
  const approveVerifier = async (verifierAddress) => {
    try {
      const tx = await contract.approveVerifier(verifierAddress);
      await tx.wait();
      toast.success('Company approved successfully');
      return tx;
    } catch (error) {
      console.error('Error approving verifier:', error);
      toast.error('Failed to approve company');
      throw error;
    }
  };

  const rejectVerifier = async (verifierAddress) => {
    try {
      const tx = await contract.rejectVerifier(verifierAddress);
      await tx.wait();
      toast.success('Company access revoked');
      return tx;
    } catch (error) {
      console.error('Error rejecting verifier:', error);
      toast.error('Failed to revoke company access');
      throw error;
    }
  };

  const getUniversityApprovedVerifiers = async (universityAddress) => {
    try {
      const addresses = await contract.getUniversityApprovedVerifiers(universityAddress);
      const approvedVerifiers = [];
      for (let addr of addresses) {
        const verifier = await contract.verifiers(addr);
        const isApproved = await contract.isVerifierApprovedByUniversity(universityAddress, addr);
        if (isApproved) {
          approvedVerifiers.push({ address: addr, ...verifier });
        }
      }
      return approvedVerifiers;
    } catch (error) {
      console.error('Error fetching approved verifiers:', error);
      return [];
    }
  };

  const isVerifierApprovedByUniversity = async (universityAddress, verifierAddress) => {
    try {
      return await contract.isVerifierApprovedByUniversity(universityAddress, verifierAddress);
    } catch (error) {
      console.error('Error checking approval:', error);
      return false;
    }
  };

  const getVerifierApprovedUniversities = async (verifierAddress) => {
    try {
      const addresses = await contract.getVerifierApprovedUniversities(verifierAddress);
      const universities = [];
      for (let addr of addresses) {
        const uni = await contract.universities(addr);
        const isApproved = await contract.isVerifierApprovedByUniversity(addr, verifierAddress);
        if (isApproved) {
          universities.push({ address: addr, ...uni });
        }
      }
      return universities;
    } catch (error) {
      console.error('Error fetching approved universities:', error);
      return [];
    }
  };

  // Verifier sends approval request to university
  const sendApprovalRequest = async (universityAddress, message) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.sendApprovalRequest(universityAddress, message);
      await tx.wait();
      toast.success('Approval request sent to university');
      return true;
    } catch (error) {
      console.error('Error sending approval request:', error);
      toast.error('Failed to send approval request');
      return false;
    }
  };

  // University responds to approval request
  const respondToApprovalRequest = async (requestHash, approve) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.respondToApprovalRequest(requestHash, approve);
      await tx.wait();
      toast.success(approve ? 'Verifier approved' : 'Verifier rejected');
      return true;
    } catch (error) {
      console.error('Error responding to approval request:', error);
      toast.error('Failed to respond to request');
      return false;
    }
  };

  // Get approval requests for university
  const getUniversityApprovalRequests = async (universityAddress) => {
    try {
      if (!contract) return [];
      const requestHashes = await contract.getUniversityApprovalRequests(universityAddress);
      const requests = [];
      
      for (const hash of requestHashes) {
        const request = await contract.approvalRequests(hash);
        const verifier = await contract.verifiers(request.verifierAddress);
        requests.push({
          hash,
          verifierAddress: request.verifierAddress,
          verifierName: verifier.companyName,
          message: request.message,
          isApproved: request.isApproved,
          isRejected: request.isRejected,
          requestedAt: Number(request.requestedAt),
          respondedAt: Number(request.respondedAt),
        });
      }
      
      return requests;
    } catch (error) {
      console.error('Error fetching approval requests:', error);
      return [];
    }
  };

  // Get approval requests sent by verifier
  const getVerifierApprovalRequests = async (verifierAddress) => {
    try {
      if (!contract) return [];
      const requestHashes = await contract.getVerifierApprovalRequests(verifierAddress);
      const requests = [];
      
      for (const hash of requestHashes) {
        const request = await contract.approvalRequests(hash);
        const university = await contract.universities(request.universityAddress);
        requests.push({
          hash,
          universityAddress: request.universityAddress,
          universityName: university.name,
          message: request.message,
          isApproved: request.isApproved,
          isRejected: request.isRejected,
          requestedAt: Number(request.requestedAt),
          respondedAt: Number(request.respondedAt),
        });
      }
      
      return requests;
    } catch (error) {
      console.error('Error fetching verifier requests:', error);
      return [];
    }
  };

  // Get student profile with APAAR ID
  const getStudentProfile = async (studentAddress) => {
    try {
      const student = await contract.students(studentAddress);
      return {
        name: student.name || student[0],
        email: student.email || student[1],
        studentId: student.studentId || student[2],
        apaarId: student.apaarId || student[3],
        walletAddress: student.walletAddress || student[4],
        universityAddress: student.universityAddress || student[5],
        yearOfJoining: Number(student.yearOfJoining || student[6]),
        branch: student.branch || student[7],
        isActive: student.isActive !== undefined ? student.isActive : student[8],
        registeredAt: Number(student.registeredAt || student[9]),
        ipfsHash: student.ipfsHash || student[10],
      };
    } catch (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }
  };

  // Get student by APAAR ID
  const getStudentByApaarId = async (apaarId) => {
    try {
      const studentAddress = await contract.getStudentByApaarId(apaarId);
      if (studentAddress === ethers.ZeroAddress) {
        return null;
      }
      return await getStudentProfile(studentAddress);
    } catch (error) {
      console.error('Error fetching student by APAAR ID:', error);
      return null;
    }
  };

  // Registration Request Functions
  const submitRegistrationRequest = async (requestData) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.submitRegistrationRequest(
        requestData.entityType,
        requestData.name,
        requestData.registrationNumber,
        requestData.email,
        requestData.contactPerson,
        requestData.phoneNumber,
        requestData.website || '',
        requestData.description || ''
      );
      await tx.wait();
      toast.success('Registration request submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting registration request:', error);
      toast.error('Failed to submit registration request');
      throw error;
    }
  };

  const getPendingRegistrationRequests = async () => {
    try {
      if (!contract) return [];
      const requestHashes = await contract.getPendingRegistrationRequests();
      const requests = [];
      
      for (const hash of requestHashes) {
        const request = await contract.registrationRequests(hash);
        requests.push({
          hash,
          walletAddress: request.walletAddress,
          entityType: request.entityType,
          name: request.name,
          registrationNumber: request.registrationNumber,
          email: request.email,
          contactPerson: request.contactPerson,
          phoneNumber: request.phoneNumber,
          website: request.website,
          description: request.description,
          isApproved: request.isApproved,
          isRejected: request.isRejected,
          requestedAt: Number(request.requestedAt),
          respondedAt: Number(request.respondedAt),
        });
      }
      
      return requests;
    } catch (error) {
      console.error('Error fetching pending registration requests:', error);
      return [];
    }
  };

  const approveRegistrationRequest = async (requestHash) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.approveRegistrationRequest(requestHash);
      await tx.wait();
      toast.success('Registration request approved');
      return true;
    } catch (error) {
      console.error('Error approving registration request:', error);
      toast.error('Failed to approve registration request');
      throw error;
    }
  };

  const rejectRegistrationRequest = async (requestHash, reason) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.rejectRegistrationRequest(requestHash, reason || 'Request rejected');
      await tx.wait();
      toast.success('Registration request rejected');
      return true;
    } catch (error) {
      console.error('Error rejecting registration request:', error);
      toast.error('Failed to reject registration request');
      throw error;
    }
  };

  const hasRegistrationRequest = async (address) => {
    try {
      if (!contract) return false;
      return await contract.hasRegistrationRequest(address);
    } catch (error) {
      console.error('Error checking registration request:', error);
      return false;
    }
  };

  // Document Verification Functions
  const submitDocumentVerification = async (documentHash, studentAddress, documentType, status, comments) => {
    try {
      const tx = await contract.submitDocumentVerification(
        documentHash,
        studentAddress,
        documentType,
        status,
        comments
      );
      await tx.wait();
      toast.success(`Document marked as ${status === 'verified' ? 'Verified' : 'Needs More Documents'}`);
      return tx;
    } catch (error) {
      console.error('Error submitting document verification:', error);
      toast.error('Failed to submit verification');
      throw error;
    }
  };

  const getDocumentVerification = async (documentHash, verifierAddress) => {
    try {
      const verification = await contract.getDocumentVerification(documentHash, verifierAddress);
      
      // Check if verification exists (verifiedAt will be 0 if not verified)
      const verifiedAt = verification.verifiedAt || verification[6];
      if (!verifiedAt || verifiedAt.toString() === '0') {
        return null;
      }
      
      const status = verification.status || verification[4];
      if (!status || status === '') {
        return null;
      }
      
      return {
        verifierAddress: verification.verifierAddress || verification[0],
        studentAddress: verification.studentAddress || verification[1],
        documentHash: verification.documentHash || verification[2],
        documentType: verification.documentType || verification[3],
        status: status,
        comments: verification.comments || verification[5],
        verifiedAt: verifiedAt,
      };
    } catch (error) {
      console.error('Error fetching document verification:', error);
      return null;
    }
  };

  const getStudentVerificationNotifications = async (studentAddress) => {
    try {
      const notifications = await contract.getStudentVerificationNotifications(studentAddress);
      return notifications;
    } catch (error) {
      console.error('Error fetching verification notifications:', error);
      return [];
    }
  };

  const getVerificationNotificationCount = async (studentAddress) => {
    try {
      const count = await contract.getVerificationNotificationCount(studentAddress);
      return Number(count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
      return 0;
    }
  };

  const value = {
    provider,
    signer,
    contract,
    account,
    isConnected,
    isLoading,
    userRole,
    userProfile,
    connectWallet,
    disconnectWallet,
    // Admin
    registerUniversity,
    registerVerifier,
    getAllUniversities,
    getAllVerifiers,
    // University
    registerStudent,
    updateStudentDetails,
    issueAcademicCertificate,
    getUniversityStudents,
    approveNonAcademicCertificate,
    rejectNonAcademicCertificate,
    // Student
    uploadNonAcademicCertificate,
    uploadVerifiedNonAcademicCertificate,
    getStudentCertificates,
    shareCertificateWithVerifier,
    getStudentRequests,
    respondToCertificateRequest,
    getStudentProfile,
    getStudentByApaarId,
    // Verifier
    requestCertificates,
    getSharedCertificates,
    getAllStudents,
    sendApprovalRequest,
    getVerifierApprovalRequests,
    // Grade Sheets
    uploadGradeSheetToBlockchain,
    getStudentGradeSheets,
    // Company Approval
    approveVerifier,
    rejectVerifier,
    respondToApprovalRequest,
    getUniversityApprovalRequests,
    getUniversityApprovedVerifiers,
    isVerifierApprovedByUniversity,
    getVerifierApprovedUniversities,
    // Registration Requests
    submitRegistrationRequest,
    getPendingRegistrationRequests,
    approveRegistrationRequest,
    rejectRegistrationRequest,
    hasRegistrationRequest,
    // Document Verification
    submitDocumentVerification,
    getDocumentVerification,
    getStudentVerificationNotifications,
    getVerificationNotificationCount,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};
