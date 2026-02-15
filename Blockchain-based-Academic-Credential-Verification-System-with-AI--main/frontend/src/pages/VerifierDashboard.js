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
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  Description as DocumentIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';
import { useNavigate } from 'react-router-dom';
import DocumentViewerModal from '../components/DocumentViewerModal';

const VerifierDashboard = () => {
  const {
    sendApprovalRequest,
    getVerifierApprovalRequests,
    getStudentByApaarId,
    getStudentCertificates,
    getStudentGradeSheets,
    getAllUniversities,
    getAllStudents,
    requestCertificates,
    account,
    disconnectWallet,
    contract,
    submitDocumentVerification,
    getDocumentVerification,
  } = useBlockchain();

  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [universities, setUniversities] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [searchApaarId, setSearchApaarId] = useState('');
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [studentDocuments, setStudentDocuments] = useState({ certificates: [], gradeSheets: [] });
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [viewerModal, setViewerModal] = useState({ open: false, document: null, studentAddress: null });

  useEffect(() => {
    if (account) {
      loadData();
    }
  }, [account]);

  const loadData = async () => {
    try {
      setLoading(true);
      const unis = await getAllUniversities();
      setUniversities(unis);

      const requests = await getVerifierApprovalRequests(account);
      setApprovalRequests(requests);
      
      // Load shared documents
      await loadSharedDocuments();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSharedDocuments = async () => {
    try {
      if (!contract || !account) {
        console.log('Contract or account not available');
        return;
      }
      
      console.log('Loading shared documents for verifier:', account);
      
      // Get all students
      const students = await getAllStudents();
      console.log('Total students:', students.length);
      
      const allSharedDocs = [];
      
      // For each student, check if they've shared documents with this verifier
      for (const student of students) {
        try {
          console.log('Checking student:', student.name, student.address);
          
          // Get shared certificates
          let sharedCertHashes = [];
          try {
            sharedCertHashes = await contract.getSharedCertificates(student.address, account);
            console.log(`Shared certificates from ${student.name}:`, sharedCertHashes.length);
          } catch (err) {
            console.error('Error fetching shared certificates:', err);
          }
          
          // Get shared grade sheets
          let sharedGradeHashes = [];
          try {
            sharedGradeHashes = await contract.getSharedGradeSheets(student.address, account);
            console.log(`Shared grade sheets from ${student.name}:`, sharedGradeHashes.length);
          } catch (err) {
            console.error('Error fetching shared grade sheets:', err);
          }
          
          if (sharedCertHashes.length > 0 || sharedGradeHashes.length > 0) {
            console.log(`Found shared documents from ${student.name}`);
            
            // Fetch certificate details
            const certificates = [];
            for (const hash of sharedCertHashes) {
              try {
                const cert = await contract.getCertificate(hash);
                
                // Fetch verification status for this document
                let verification = null;
                try {
                  verification = await getDocumentVerification(hash, account);
                } catch (verErr) {
                  console.log('No verification found for certificate:', hash);
                }
                
                certificates.push({
                  hash,
                  certificateHash: cert.certificateHash || cert[0],
                  certificateName: cert.certificateName || cert[1],
                  certificateType: cert.certificateType !== undefined ? Number(cert.certificateType) : Number(cert[4]),
                  status: cert.status !== undefined ? Number(cert.status) : Number(cert[5]),
                  issueDate: cert.issueDate || cert[6],
                  ipfsHash: cert.ipfsHash || cert[12],
                  verification: verification,
                });
              } catch (err) {
                console.error('Error fetching certificate details:', err);
              }
            }
            
            // Fetch grade sheet details
            const gradeSheets = [];
            for (const hash of sharedGradeHashes) {
              try {
                const sheet = await contract.gradeSheets(hash);
                
                // Fetch verification status for this document
                let verification = null;
                try {
                  verification = await getDocumentVerification(hash, account);
                } catch (verErr) {
                  console.log('No verification found for grade sheet:', hash);
                }
                
                gradeSheets.push({
                  hash,
                  ipfsHash: sheet.ipfsHash || sheet[1],
                  semester: sheet.semester || sheet[5],
                  academicYear: sheet.academicYear || sheet[6],
                  uploadDate: sheet.uploadDate || sheet[4],
                  verification: verification,
                });
              } catch (err) {
                console.error('Error fetching grade sheet details:', err);
              }
            }
            
            allSharedDocs.push({
              student: student,
              certificates: certificates,
              gradeSheets: gradeSheets,
              sharedAt: Date.now(),
            });
          }
        } catch (error) {
          console.error(`Error loading shared docs for student ${student.address}:`, error);
        }
      }
      
      console.log('Total shared documents found:', allSharedDocs.length);
      console.log('Shared documents details:', allSharedDocs);
      setSharedDocuments(allSharedDocs);
      
      if (allSharedDocs.length === 0) {
        console.warn('⚠️ No shared documents found. Possible reasons:');
        console.warn('1. No students have approved your access requests yet');
        console.warn('2. Students approved but did not select any documents to share');
        console.warn('3. Contract address mismatch');
        console.warn('4. Verifier account mismatch');
      }
    } catch (error) {
      console.error('Error loading shared documents:', error);
    }
  };

  const handleSearchStudent = async () => {
    if (!searchApaarId) return;

    try {
      setLoading(true);
      const student = await getStudentByApaarId(searchApaarId);
      
      if (student) {
        // Check if company has approved access from student's university
        const hasApprovedAccess = approvedUniversities.some(
          r => r.universityAddress.toLowerCase() === student.universityAddress.toLowerCase()
        );

        if (!hasApprovedAccess) {
          // Find the university name
          const studentUniversity = universities.find(
            u => u.address.toLowerCase() === student.universityAddress.toLowerCase()
          );
          const universityName = studentUniversity?.name || 'this university';

          setSearchedStudent(null);
          setStudentDocuments({ certificates: [], gradeSheets: [] });
          alert(
            `Access Denied!\n\nYou need to request and get approval from ${universityName} before you can view students from that institution.\n\nPlease go to the "Universities" tab to send an access request.`
          );
          return;
        }

        setSearchedStudent(student);
        
        // Load student documents
        const certs = await getStudentCertificates(student.walletAddress);
        const sheets = await getStudentGradeSheets(student.walletAddress);
        
        setStudentDocuments({
          certificates: certs.filter(c => c.status === 1), // Only verified
          gradeSheets: sheets,
        });
      } else {
        setSearchedStudent(null);
        setStudentDocuments({ certificates: [], gradeSheets: [] });
        alert('Student not found with this APAAR ID');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      alert('Error searching student');
    } finally {
      setLoading(false);
    }
  };

  const handleSendUniversityRequest = async (universityAddress) => {
    if (!requestMessage) {
      alert('Please enter a message');
      return;
    }

    try {
      setLoading(true);
      await sendApprovalRequest(universityAddress, requestMessage);
      setRequestMessage('');
      await loadData();
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDocumentAccess = async () => {
    if (!searchedStudent) return;

    try {
      setLoading(true);
      await requestCertificates(searchedStudent.walletAddress, 'Request for document verification');
      alert('Access request sent to student');
    } catch (error) {
      console.error('Error requesting access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewer = (document, studentAddress, type) => {
    setViewerModal({
      open: true,
      document: { ...document, type },
      studentAddress,
    });
  };

  const handleCloseViewer = () => {
    setViewerModal({ open: false, document: null, studentAddress: null });
  };

  const handleSubmitVerification = async (verificationData) => {
    try {
      await submitDocumentVerification(
        verificationData.documentHash,
        verificationData.studentAddress,
        verificationData.documentType,
        verificationData.status,
        verificationData.comments
      );
      // Reload shared documents to reflect any changes
      await loadSharedDocuments();
    } catch (error) {
      console.error('Error submitting verification:', error);
      throw error;
    }
  };

  const approvedUniversities = approvalRequests.filter(r => r.isApproved);
  const pendingRequests = approvalRequests.filter(r => !r.isApproved && !r.isRejected);

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
              <BusinessIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700 }}>
              BlockVerify - Company Portal
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
            <Tab icon={<SchoolIcon />} iconPosition="start" label="Universities" />
            <Tab icon={<SearchIcon />} iconPosition="start" label="Search Students" />
            <Tab icon={<DocumentIcon />} iconPosition="start" label={`Shared Documents (${sharedDocuments.length})`} />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="My Requests" />
          </Tabs>
        </Paper>

        {/* Tab 0: Universities */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              University Access
            </Typography>

            {/* Approved Universities */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Approved Universities ({approvedUniversities.length})
            </Typography>
            {approvedUniversities.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center', mb: 4 }}>
                <SchoolIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  No approved universities yet
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {approvedUniversities.map((request, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {request.universityName}
                        </Typography>
                        <Chip
                          label="Access Granted"
                          size="small"
                          sx={{
                            bgcolor: '#ECFDF5',
                            color: '#065F46',
                            fontWeight: 600,
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Request Access */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Request University Access
            </Typography>
            
            {universities.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 6, textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                  No universities available
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Universities will appear here once registered by admin
                </Typography>
              </Paper>
            ) : (
              <Box>
                <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 3, mb: 3, bgcolor: '#F0F9FF' }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Step 1:</strong> Enter your request message below
                  </Alert>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Request Message"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="e.g., For campus recruitment 2024"
                    helperText="This message will be sent to the university"
                  />
                </Paper>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Step 2:</strong> Select a university below and click "Send Request"
                </Alert>

                <Grid container spacing={3}>
                  {universities.map((uni, index) => {
                    const hasRequested = approvalRequests.some(r => r.universityAddress === uni.address);
                    const isApproved = approvedUniversities.some(r => r.universityAddress === uni.address);
                    
                    return (
                      <Grid item xs={12} md={6} key={index}>
                        <Card 
                          elevation={0} 
                          sx={{ 
                            border: '2px solid #E5E7EB', 
                            borderRadius: 3,
                            '&:hover': {
                              borderColor: '#4F46E5',
                              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)',
                            },
                          }}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 2,
                                  bgcolor: '#EEF2FF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <SchoolIcon sx={{ color: '#4F46E5', fontSize: 24 }} />
                              </Box>
                              <Box flexGrow={1}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {uni.name || uni[0] || 'University'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                  {uni.email || uni[2] || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                            
                            {isApproved ? (
                              <Chip 
                                label="✓ Access Granted" 
                                sx={{
                                  bgcolor: '#ECFDF5',
                                  color: '#065F46',
                                  fontWeight: 600,
                                  width: '100%',
                                }}
                              />
                            ) : hasRequested ? (
                              <Chip 
                                label="⏳ Pending Approval" 
                                sx={{
                                  bgcolor: '#FEF3C7',
                                  color: '#92400E',
                                  fontWeight: 600,
                                  width: '100%',
                                }}
                              />
                            ) : (
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<SendIcon />}
                                onClick={() => handleSendUniversityRequest(uni.address)}
                                disabled={loading || !requestMessage}
                                sx={{
                                  bgcolor: '#4F46E5',
                                  textTransform: 'none',
                                  py: 1.5,
                                  '&:hover': { bgcolor: '#4338CA' },
                                }}
                              >
                                Send Access Request
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 1: Search Students */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              Search Students by APAAR ID
            </Typography>

            {/* Search Box */}
            <Paper elevation={0} sx={{ border: '2px solid #E5E7EB', borderRadius: 3, p: 3, mb: 4 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Search for students using their government-issued APAAR ID
              </Alert>

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="APAAR ID"
                  value={searchApaarId}
                  onChange={(e) => setSearchApaarId(e.target.value)}
                  placeholder="APAAR-2024-12345"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchStudent()}
                />
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearchStudent}
                  disabled={loading || !searchApaarId}
                  sx={{
                    bgcolor: '#4F46E5',
                    textTransform: 'none',
                    px: 4,
                    '&:hover': { bgcolor: '#4338CA' },
                  }}
                >
                  Search
                </Button>
              </Box>
            </Paper>

            {/* Student Results */}
            {searchedStudent && (
              <Grid container spacing={3}>
                {/* Student Profile Block */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ border: '2px solid #E5E7EB', borderRadius: 3, p: 3, height: '100%' }}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          bgcolor: '#EEF2FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonIcon sx={{ color: '#4F46E5', fontSize: 32 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Student Profile
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          Personal Information
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                        {searchedStudent.name}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        APAAR ID
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#4F46E5' }}>
                        {searchedStudent.apaarId}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Student ID
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {searchedStudent.studentId}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Branch
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {searchedStudent.branch}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Year of Joining
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {searchedStudent.yearOfJoining}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {searchedStudent.email}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={handleRequestDocumentAccess}
                      disabled={loading}
                      sx={{
                        bgcolor: '#4F46E5',
                        textTransform: 'none',
                        py: 1.5,
                        mt: 2,
                        '&:hover': { bgcolor: '#4338CA' },
                      }}
                    >
                      Request Document Access
                    </Button>
                  </Paper>
                </Grid>

                {/* Documents Block */}
                <Grid item xs={12} md={8}>
                  <Box>
                    {/* Grade Sheets Block */}
                    <Paper elevation={0} sx={{ border: '2px solid #E5E7EB', borderRadius: 3, p: 3, mb: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: '#FEF3C7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <DocumentIcon sx={{ color: '#92400E', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Grade Sheets
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {studentDocuments.gradeSheets.length} available
                          </Typography>
                        </Box>
                      </Box>

                      {studentDocuments.gradeSheets.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                            No grade sheets available
                          </Typography>
                        </Box>
                      ) : (
                        <Grid container spacing={2}>
                          {studentDocuments.gradeSheets.map((sheet, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: '#FFFBEB' }}>
                                <CardContent>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {sheet.semester || 'Grade Sheet'}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                    {sheet.academicYear || 'Academic Year'}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Paper>

                    {/* Certificates Block */}
                    <Paper elevation={0} sx={{ border: '2px solid #E5E7EB', borderRadius: 3, p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: '#ECFDF5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <DocumentIcon sx={{ color: '#065F46', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Verified Certificates
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {studentDocuments.certificates.length} verified
                          </Typography>
                        </Box>
                      </Box>

                      {studentDocuments.certificates.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                            No verified certificates available
                          </Typography>
                        </Box>
                      ) : (
                        <Grid container spacing={2}>
                          {studentDocuments.certificates.map((cert, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: '#F0FDF4' }}>
                                <CardContent>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    {cert.certificateName}
                                  </Typography>
                                  <Chip
                                    label="✓ Verified"
                                    size="small"
                                    sx={{
                                      bgcolor: '#ECFDF5',
                                      color: '#065F46',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                    }}
                                  />
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 2: Shared Documents */}
        {tabValue === 2 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                Shared Documents
              </Typography>
              <Button
                variant="outlined"
                onClick={loadSharedDocuments}
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
              This section shows all documents that students have explicitly shared with you.
              Check the browser console for detailed logs.
            </Alert>

            {sharedDocuments.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 6, textAlign: 'center' }}>
                <DocumentIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                  No shared documents yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                  Students will share their documents with you after approving your access requests
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  Debug: Check console logs for details
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {sharedDocuments.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper elevation={0} sx={{ border: '2px solid #E5E7EB', borderRadius: 3, p: 3 }}>
                      {/* Student Info Header */}
                      <Box display="flex" alignItems="center" gap={2} mb={3} pb={2} borderBottom="1px solid #E5E7EB">
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: '#EEF2FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <PersonIcon sx={{ color: '#4F46E5', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {item.student.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            APAAR ID: {item.student.apaarId} • Student ID: {item.student.studentId}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Grade Sheets */}
                      {item.gradeSheets.length > 0 && (
                        <Box mb={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#92400E' }}>
                            📚 Grade Sheets ({item.gradeSheets.length})
                          </Typography>
                          <Grid container spacing={2}>
                            {item.gradeSheets.map((sheet, idx) => (
                              <Grid item xs={12} md={6} key={idx}>
                                <Card elevation={0} sx={{ border: '1px solid #F59E0B', borderRadius: 2, bgcolor: '#FFFBEB' }}>
                                  <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {sheet.semester} - {sheet.academicYear}
                                      </Typography>
                                      {sheet.verification && sheet.verification.status && (
                                        <Chip
                                          label={sheet.verification.status === 'verified' ? '✓ Verified' : '⚠ Need More Docs'}
                                          size="small"
                                          sx={{
                                            bgcolor: sheet.verification.status === 'verified' ? '#ECFDF5' : '#FEF3C7',
                                            color: sheet.verification.status === 'verified' ? '#065F46' : '#92400E',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
                                      Uploaded: {new Date(Number(sheet.uploadDate) * 1000).toLocaleDateString()}
                                    </Typography>
                                    {sheet.verification && sheet.verification.comments && (
                                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1, fontStyle: 'italic' }}>
                                        💬 {sheet.verification.comments}
                                      </Typography>
                                    )}
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<ViewIcon />}
                                      onClick={() => handleOpenViewer(sheet, item.student.address, 'gradeSheet')}
                                      sx={{
                                        bgcolor: '#F59E0B',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#D97706' },
                                      }}
                                    >
                                      {sheet.verification && sheet.verification.status ? 'View Again' : 'View & Verify'}
                                    </Button>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Certificates */}
                      {item.certificates.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#4F46E5' }}>
                            🎓 Certificates ({item.certificates.length})
                          </Typography>
                          <Grid container spacing={2}>
                            {item.certificates.map((cert, idx) => (
                              <Grid item xs={12} md={6} key={idx}>
                                <Card elevation={0} sx={{ border: '1px solid #4F46E5', borderRadius: 2, bgcolor: '#F0F9FF' }}>
                                  <CardContent>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {cert.certificateName}
                                    </Typography>
                                    <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                                      <Chip
                                        label={cert.certificateType === 0 ? 'Academic' : 'Professional'}
                                        size="small"
                                        sx={{
                                          bgcolor: cert.certificateType === 0 ? '#EEF2FF' : '#F0FDF4',
                                          color: cert.certificateType === 0 ? '#4F46E5' : '#065F46',
                                          fontSize: '0.75rem',
                                        }}
                                      />
                                      <Chip
                                        label={cert.status === 1 ? 'Verified' : 'Pending'}
                                        size="small"
                                        sx={{
                                          bgcolor: cert.status === 1 ? '#ECFDF5' : '#FEF3C7',
                                          color: cert.status === 1 ? '#065F46' : '#92400E',
                                          fontSize: '0.75rem',
                                        }}
                                      />
                                      {cert.verification && cert.verification.status && (
                                        <Chip
                                          label={cert.verification.status === 'verified' ? '✓ Verified by You' : '⚠ Need More Docs'}
                                          size="small"
                                          sx={{
                                            bgcolor: cert.verification.status === 'verified' ? '#ECFDF5' : '#FEF3C7',
                                            color: cert.verification.status === 'verified' ? '#065F46' : '#92400E',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
                                      Issued: {new Date(Number(cert.issueDate) * 1000).toLocaleDateString()}
                                    </Typography>
                                    {cert.verification && cert.verification.comments && (
                                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1, fontStyle: 'italic' }}>
                                        💬 {cert.verification.comments}
                                      </Typography>
                                    )}
                                    {cert.ipfsHash && (
                                      <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<ViewIcon />}
                                        onClick={() => handleOpenViewer(cert, item.student.address, 'certificate')}
                                        sx={{
                                          bgcolor: '#4F46E5',
                                          textTransform: 'none',
                                          '&:hover': { bgcolor: '#4338CA' },
                                        }}
                                      >
                                        {cert.verification && cert.verification.status ? 'View Again' : 'View & Verify'}
                                      </Button>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 3: My Requests */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              My Access Requests
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Pending Requests ({pendingRequests.length})
            </Typography>
            {pendingRequests.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center', mb: 4 }}>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  No pending requests
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {pendingRequests.map((request, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {request.universityName}
                        </Typography>
                        <Chip
                          label="Pending Approval"
                          size="small"
                          sx={{
                            bgcolor: '#FEF3C7',
                            color: '#92400E',
                            fontWeight: 600,
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Approved ({approvedUniversities.length})
            </Typography>
            <Grid container spacing={3}>
              {approvedUniversities.map((request, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {request.universityName}
                      </Typography>
                      <Chip
                        label="Approved"
                        size="small"
                        sx={{
                          bgcolor: '#ECFDF5',
                          color: '#065F46',
                          fontWeight: 600,
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        open={viewerModal.open}
        onClose={handleCloseViewer}
        document={viewerModal.document}
        studentAddress={viewerModal.studentAddress}
        onSubmitVerification={handleSubmitVerification}
      />
    </Box>
  );
};

export default VerifierDashboard;
