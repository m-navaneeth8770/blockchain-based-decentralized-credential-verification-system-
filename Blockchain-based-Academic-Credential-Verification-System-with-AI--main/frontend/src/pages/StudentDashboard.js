import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  School as SchoolIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  Work as WorkIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';
import { useNavigate } from 'react-router-dom';
import APAARCard from '../components/APAARCard';
import AccessRequestCard from '../components/AccessRequestCard';
import ViewNotification from '../components/ViewNotification';
import CertificateUploadModal from '../components/CertificateUploadModal';
import CertificateSelectionModal from '../components/CertificateSelectionModal';
import ProfessionalCertificateUpload from '../components/ProfessionalCertificateUpload';
import { getIPFSUrl, fetchFromIPFS, uploadFileToIPFS, uploadJSONToIPFS } from '../utils/ipfs';

const StudentDashboard = () => {
  const {
    getStudentProfile,
    getStudentCertificates,
    getStudentGradeSheets,
    getStudentRequests,
    respondToCertificateRequest,
    uploadNonAcademicCertificate,
    uploadVerifiedNonAcademicCertificate,
    account,
    disconnectWallet,
    getStudentVerificationNotifications,
    getDocumentVerification,
    contract,
    getAllVerifiers,
  } = useBlockchain();

  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [studentProfile, setStudentProfile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [gradeSheets, setGradeSheets] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [viewNotifications, setViewNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [certSelectionModalOpen, setCertSelectionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [professionalCertModalOpen, setProfessionalCertModalOpen] = useState(false);
  const [professionalCertificates, setProfessionalCertificates] = useState([]);

  useEffect(() => {
    if (account) {
      loadData();
    }
  }, [account]);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await getStudentProfile(account);
      setStudentProfile(profile);

      const certs = await getStudentCertificates(account);
      setCertificates(certs);

      const sheets = await getStudentGradeSheets(account);
      setGradeSheets(sheets);

      const requests = await getStudentRequests(account);
      console.log('Loaded access requests:', requests);
      setAccessRequests(requests);

      // Load verifications with the fetched data
      await loadVerifications(certs, sheets, requests);

      // Mock view notifications (in real app, fetch from backend/events)
      setViewNotifications([]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerifications = async (certs, sheets, requests) => {
    try {
      console.log('Loading verifications for:', { certs: certs.length, sheets: sheets.length, requests: requests.length });
      
      // Get all verifiers to map addresses to names
      const allVerifiers = await getAllVerifiers();
      console.log('All verifiers fetched:', allVerifiers);
      
      const verifierMap = {};
      allVerifiers.forEach(verifier => {
        const companyName = verifier.companyName || verifier.name || 'Company';
        verifierMap[verifier.address.toLowerCase()] = companyName;
        console.log(`Mapping ${verifier.address} -> ${companyName}`);
      });
      console.log('Final verifier map:', verifierMap);
      
      const verificationsData = [];
      
      // For each certificate, check if there are verifications
      for (const cert of certs) {
        try {
          // Get all verifiers who might have verified this
          for (const request of requests) {
            if (request.isApproved) {
              try {
                console.log('Checking verification for cert:', cert.hash, 'from verifier:', request.verifierAddress);
                const verification = await getDocumentVerification(cert.hash, request.verifierAddress);
                console.log('Verification result:', verification);
                
                if (verification && verification.status) {
                  const lookupAddress = request.verifierAddress.toLowerCase();
                  console.log('Looking up verifier name for address:', lookupAddress);
                  console.log('Found in map:', verifierMap[lookupAddress]);
                  
                  const verifierName = verifierMap[lookupAddress] || 
                                      request.verifierName || 
                                      'Company';
                  
                  console.log('Final verifier name:', verifierName);
                  
                  verificationsData.push({
                    documentHash: cert.hash,
                    documentName: cert.certificateName,
                    documentType: 'certificate',
                    verifierAddress: request.verifierAddress,
                    verifierName: verifierName,
                    ...verification,
                  });
                }
              } catch (err) {
                console.log('No verification from this verifier for cert:', err.message);
              }
            }
          }
        } catch (err) {
          console.error('Error loading verification for certificate:', err);
        }
      }
      
      // For each grade sheet, check if there are verifications
      for (const sheet of sheets) {
        try {
          for (const request of requests) {
            if (request.isApproved) {
              try {
                console.log('Checking verification for sheet:', sheet.hash, 'from verifier:', request.verifierAddress);
                const verification = await getDocumentVerification(sheet.hash, request.verifierAddress);
                console.log('Verification result:', verification);
                
                if (verification && verification.status) {
                  const lookupAddress = request.verifierAddress.toLowerCase();
                  console.log('Looking up verifier name for address:', lookupAddress);
                  console.log('Found in map:', verifierMap[lookupAddress]);
                  
                  const verifierName = verifierMap[lookupAddress] || 
                                      request.verifierName || 
                                      'Company';
                  
                  console.log('Final verifier name:', verifierName);
                  
                  verificationsData.push({
                    documentHash: sheet.hash,
                    documentName: `${sheet.semester} - ${sheet.academicYear}`,
                    documentType: 'gradeSheet',
                    verifierAddress: request.verifierAddress,
                    verifierName: verifierName,
                    ...verification,
                  });
                }
              } catch (err) {
                console.log('No verification from this verifier for sheet:', err.message);
              }
            }
          }
        } catch (err) {
          console.error('Error loading verification for grade sheet:', err);
        }
      }
      
      console.log('Total verifications loaded:', verificationsData.length);
      console.log('Verifications data:', verificationsData);
      setVerifications(verificationsData);
    } catch (error) {
      console.error('Error loading verifications:', error);
    }
  };

  const handleOpenCertSelection = (request) => {
    // Check if already responded
    if (request.isApproved || request.isRejected) {
      alert('This request has already been responded to');
      return;
    }
    setSelectedRequest(request);
    setCertSelectionModalOpen(true);
  };

  const handleApproveRequest = async (request, selectedHashes) => {
    try {
      setLoading(true);
      
      // Separate certificate hashes from grade sheet hashes
      const certHashes = selectedHashes.filter(hash => 
        certificates.some(cert => cert.hash === hash)
      );
      const gradeSheetHashes = selectedHashes.filter(hash => 
        gradeSheets.some(sheet => sheet.hash === hash)
      );
      
      console.log('Sharing certificates:', certHashes);
      console.log('Sharing grade sheets:', gradeSheetHashes);
      
      await respondToCertificateRequest(request.hash, true, certHashes, gradeSheetHashes);
      setCertSelectionModalOpen(false);
      setSelectedRequest(null);
      await loadData();
    } catch (error) {
      console.error('Error approving request:', error);
      // Error is already shown by toast in BlockchainContext
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      setLoading(true);
      await respondToCertificateRequest(request.hash, false, []);
      setCertSelectionModalOpen(false);
      setSelectedRequest(null);
      await loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      // Error is already shown by toast in BlockchainContext
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalCertUpload = async ({ file, verificationResult, status, autoApproved, requiresApproval, trustLevel }) => {
    try {
      setLoading(true);
      
      // Upload certificate file to IPFS
      const fileCID = await uploadFileToIPFS(file);
      
      // Create metadata with verification result
      const metadata = {
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        verificationResult: {
          status: verificationResult.finalDecision.status,
          trustLevel: verificationResult.finalDecision.trustLevel,
          verificationMethod: verificationResult.finalDecision.verificationMethod,
          confidence: verificationResult.finalDecision.confidence,
          qrCodeFound: verificationResult.qrCode?.found || false,
          urlVerified: verificationResult.urlVerification?.valid || false,
          extractedName: verificationResult.aiExtraction?.recipientName || verificationResult.extractedName,
          verificationURL: verificationResult.aiExtraction?.verificationUrl || verificationResult.extractedURLs?.[0] || null,
          courseName: verificationResult.aiExtraction?.courseName,
          issuer: verificationResult.aiExtraction?.issuer,
        },
        extractedData: {
          name: verificationResult.aiExtraction?.recipientName || verificationResult.extractedName,
          urls: verificationResult.extractedURLs || [],
          courseName: verificationResult.aiExtraction?.courseName,
          issuer: verificationResult.aiExtraction?.issuer,
        },
        autoApproved: autoApproved || false,
        requiresApproval: requiresApproval || false,
      };
      
      // Upload metadata to IPFS
      const metadataCID = await uploadJSONToIPFS(metadata);
      
      // Only upload to blockchain if HIGH/HIGHEST trust (auto-approved)
      if (autoApproved && (trustLevel === 'HIGHEST' || trustLevel === 'HIGH')) {
        const certHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
        const certName = verificationResult.aiExtraction?.courseName || file.name.replace(/\.[^/.]+$/, '');
        
        // Use uploadVerifiedNonAcademicCertificate for auto-approved certificates
        await uploadVerifiedNonAcademicCertificate(
          certHash,
          certName,
          JSON.stringify(metadata)
        );
        
        await loadData();
      } else if (requiresApproval && trustLevel === 'MEDIUM') {
        // Store in pending state for university review
        console.log('Certificate pending university approval:', metadata);
        alert('Certificate submitted for university approval. You will be notified once reviewed.');
      }
      
      setProfessionalCertModalOpen(false);
    } catch (error) {
      console.error('Error uploading professional certificate:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateUpload = async (certificateData) => {
    try {
      await uploadNonAcademicCertificate(
        certificateData.certificateHash,
        certificateData.certificateName,
        certificateData.metadata
      );
      await loadData();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      throw error;
    }
  };

  const handleViewGradeSheet = async (sheet) => {
    console.log('Viewing grade sheet:', sheet);
    
    if (!sheet.ipfsHash || sheet.ipfsHash === '') {
      console.error('No IPFS hash found for grade sheet:', sheet);
      alert('Grade sheet file not available. IPFS hash is missing.');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch metadata from IPFS
      console.log('Fetching metadata from IPFS:', sheet.ipfsHash);
      const metadata = await fetchFromIPFS(sheet.ipfsHash);
      console.log('Metadata retrieved:', metadata);
      
      // Extract the actual file CID
      const fileCID = metadata.fileCID;
      
      if (!fileCID) {
        alert('Grade sheet file CID not found in metadata');
        return;
      }
      
      // Open the actual file
      const fileUrl = getIPFSUrl(fileCID);
      console.log('Opening grade sheet file:', fileUrl);
      window.open(fileUrl, '_blank');
      
    } catch (error) {
      console.error('Error fetching grade sheet:', error);
      alert('Failed to load grade sheet. Make sure IPFS Desktop is running.');
    } finally {
      setLoading(false);
    }
  };

  const academicCerts = certificates.filter(c => c.certificateType === 0);
  const professionalCerts = certificates.filter(c => c.certificateType === 1);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', width: '100%' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <Toolbar sx={{ py: 1 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
              }}
            >
              <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700 }}>
              BlockVerify - Student Portal
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#6B7280', mr: 2 }}>
            {`${account?.slice(0, 6)}...${account?.slice(-4)}`}
          </Typography>
          <Button
            variant="outlined"
            onClick={disconnectWallet}
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Disconnect
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tabs */}
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: '1px solid #E5E7EB',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              },
            }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
            <Tab icon={<SchoolIcon />} iconPosition="start" label="Academic" />
            <Tab icon={<WorkIcon />} iconPosition="start" label="Professional" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Access Requests" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Verifications" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              Dashboard Overview
            </Typography>
            
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                      Total Documents
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                      {certificates.length + gradeSheets.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                      Verified
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#10B981' }}>
                      {certificates.filter(c => c.status === 1).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                      Pending
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                      {certificates.filter(c => c.status === 0).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                      Access Requests
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#4F46E5' }}>
                      {accessRequests.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Profile Tab */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              My Profile
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <APAARCard studentProfile={studentProfile} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                      Student Information
                    </Typography>
                    
                    {studentProfile && (
                      <Box>
                        <Box mb={2}>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>Name</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentProfile.name}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>Email</Typography>
                          <Typography variant="body1">{studentProfile.email}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>Student ID</Typography>
                          <Typography variant="body1">{studentProfile.studentId}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>Branch</Typography>
                          <Typography variant="body1">{studentProfile.branch}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>Year of Joining</Typography>
                          <Typography variant="body1">{studentProfile.yearOfJoining}</Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>Wallet Address</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {studentProfile.walletAddress}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Academic Tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              Academic Documents
            </Typography>
            
            {/* Grade Sheets */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Grade Sheets</Typography>
            {gradeSheets.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center', mb: 4 }}>
                <DocumentIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  No grade sheets available yet
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {gradeSheets.map((sheet, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {sheet.semester || 'Grade Sheet'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                          {sheet.academicYear || 'Academic Year'}
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleViewGradeSheet(sheet)}
                          sx={{
                            bgcolor: '#4F46E5',
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#4338CA' },
                          }}
                        >
                          View Grade Sheet
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Academic Certificates */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Academic Certificates</Typography>
            {academicCerts.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center' }}>
                <DocumentIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  No academic certificates yet
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {academicCerts.map((cert, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{cert.certificateName}</Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {cert.degreeType} - {cert.fieldOfStudy}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Professional Tab */}
        {tabValue === 3 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                Professional Certificates
              </Typography>
              <Button
                variant="contained"
                startIcon={<WorkIcon />}
                onClick={() => setProfessionalCertModalOpen(true)}
                sx={{
                  bgcolor: '#4F46E5',
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  '&:hover': { bgcolor: '#4338CA' },
                }}
              >
                Upload Certificate
              </Button>
            </Box>
            
            {professionalCertificates.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center' }}>
                <WorkIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#6B7280', mb: 2 }}>
                  No professional certificates yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
                  Upload internship certificates, course completions, and professional certifications
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<WorkIcon />}
                  onClick={() => setProfessionalCertModalOpen(true)}
                  sx={{
                    bgcolor: '#4F46E5',
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#4338CA' },
                  }}
                >
                  Upload Your First Certificate
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {professionalCertificates.map((cert, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {cert.certificateName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                          Status: {cert.status === 0 ? 'Pending Verification' : cert.status === 1 ? 'Verified' : 'Rejected'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          Issued: {new Date(Number(cert.issueDate) * 1000).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Access Requests Tab */}
        {tabValue === 4 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              Access Requests & Notifications
            </Typography>
            
            {/* Pending Requests */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Pending Requests</Typography>
            {accessRequests.filter(r => r.isPending).length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center', mb: 4 }}>
                <NotificationsIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  No pending access requests
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {accessRequests
                  .filter(r => r.isPending)
                  .map((request, index) => (
                    <Grid item xs={12} md={6} key={request.hash || index}>
                      <AccessRequestCard
                        request={{ ...request, status: 'pending' }}
                        onApprove={() => handleOpenCertSelection(request)}
                        onReject={handleRejectRequest}
                        loading={loading}
                      />
                    </Grid>
                  ))}
              </Grid>
            )}
            
            {/* Request History */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Request History</Typography>
            {accessRequests.filter(r => !r.isPending).length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center', mb: 4 }}>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  No request history
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {accessRequests
                  .filter(r => !r.isPending)
                  .map((request, index) => (
                    <Grid item xs={12} md={6} key={request.hash || index}>
                      <AccessRequestCard
                        request={{ 
                          ...request, 
                          status: request.isApproved ? 'approved' : 'rejected' 
                        }}
                        onApprove={handleApproveRequest}
                        onReject={handleRejectRequest}
                        loading={loading}
                      />
                    </Grid>
                  ))}
              </Grid>
            )}

            {/* View Notifications */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Document Views</Typography>
            {viewNotifications.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  No document views yet
                </Typography>
              </Paper>
            ) : (
              <Box>
                {viewNotifications.map((notification, index) => (
                  <ViewNotification key={index} notification={notification} />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Verifications Tab */}
        {tabValue === 5 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                Document Verifications
              </Typography>
              <Button
                variant="outlined"
                onClick={() => loadVerifications(certificates, gradeSheets, accessRequests)}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  borderColor: '#4F46E5',
                  color: '#4F46E5',
                }}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Companies that have reviewed your documents will provide verification status here.
            </Alert>

            {verifications.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 6, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                  No Verifications Yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Companies will verify your documents after you share them
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {verifications.map((verification, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        border: '2px solid',
                        borderColor: verification.status === 'verified' ? '#10B981' : '#F59E0B',
                        borderRadius: 3,
                        bgcolor: verification.status === 'verified' ? '#ECFDF5' : '#FFFBEB',
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {verification.documentName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              {verification.documentType === 'certificate' ? '📜 Certificate' : '📚 Grade Sheet'}
                            </Typography>
                          </Box>
                          <Chip
                            label={verification.status === 'verified' ? '✓ Verified' : '⚠ Need More Docs'}
                            sx={{
                              bgcolor: verification.status === 'verified' ? '#10B981' : '#F59E0B',
                              color: 'white',
                              fontWeight: 700,
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                            <strong>Verified by:</strong> {verification.verifierName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            <strong>Date:</strong> {new Date(Number(verification.verifiedAt) * 1000).toLocaleString()}
                          </Typography>
                        </Box>

                        {verification.comments && (
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'white', 
                              border: '1px solid #E5E7EB',
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                              💬 Comments:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#374151' }}>
                              {verification.comments}
                            </Typography>
                          </Paper>
                        )}

                        {verification.status === 'needMoreDocuments' && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            Please provide additional documents or clarification.
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>

      {/* Certificate Upload Modal */}
      <CertificateUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleCertificateUpload}
        studentName={studentProfile?.name}
      />

      {/* Certificate Selection Modal */}
      <CertificateSelectionModal
        open={certSelectionModalOpen}
        onClose={() => {
          setCertSelectionModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        certificates={certificates}
        gradeSheets={gradeSheets}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        loading={loading}
      />

      {/* Professional Certificate Upload Modal */}
      <ProfessionalCertificateUpload
        open={professionalCertModalOpen}
        onClose={() => setProfessionalCertModalOpen(false)}
        studentName={studentProfile?.name || 'Student'}
        onSuccess={handleProfessionalCertUpload}
      />
    </Box>
  );
};

export default StudentDashboard;
