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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  School as SchoolIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DocumentIcon,
  Edit as EditIcon,
  VerifiedUser as VerifiedIcon,
  Business as BusinessIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StudentRegistrationForm from '../components/StudentRegistrationForm';
import VerificationQueueCard from '../components/VerificationQueueCard';
import StudentEditModal from '../components/StudentEditModal';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../utils/ipfs';

// Student Management Tab Component
const StudentManagementTab = ({ students, onRegisterClick, onEditClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  // Get unique branches and years
  const branches = ['All', ...new Set(students.map(s => s.branch).filter(Boolean))];
  const years = ['All', ...new Set(students.map(s => Number(s.yearOfJoining)).filter(Boolean))].sort((a, b) => b - a);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.apaarId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBranch = filterBranch === 'All' || student.branch === filterBranch;
    const matchesYear = filterYear === 'All' || Number(student.yearOfJoining) === filterYear;
    
    return matchesSearch && matchesBranch && matchesYear;
  });

  // Group by branch
  const studentsByBranch = filteredStudents.reduce((acc, student) => {
    const branch = student.branch || 'Other';
    if (!acc[branch]) acc[branch] = [];
    acc[branch].push(student);
    return acc;
  }, {});

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
          Student Management
        </Typography>
        <Button
          variant="contained"
          onClick={onRegisterClick}
          sx={{
            bgcolor: '#4F46E5',
            textTransform: 'none',
            px: 3,
            '&:hover': { bgcolor: '#4338CA' },
          }}
        >
          Register Student
        </Button>
      </Box>

      {students.length === 0 ? (
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 6, textAlign: 'center' }}>
          <PeopleIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
            No students registered yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
            Register your first student to get started
          </Typography>
          <Button
            variant="contained"
            onClick={onRegisterClick}
            sx={{
              bgcolor: '#4F46E5',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4338CA' },
            }}
          >
            Register First Student
          </Button>
        </Paper>
      ) : (
        <>
          {/* Search and Filters */}
          <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by name, student ID, APAAR ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Branch"
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  size="small"
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch} value={branch}>
                      {branch}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Year"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  size="small"
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Box mt={2}>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Showing {filteredStudents.length} of {students.length} students
              </Typography>
            </Box>
          </Paper>

          {/* Students by Branch */}
          {Object.keys(studentsByBranch).length === 0 ? (
            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: '#6B7280' }}>
                No students found matching your filters
              </Typography>
            </Paper>
          ) : (
            Object.entries(studentsByBranch).map(([branch, branchStudents]) => (
              <Box key={branch} mb={4}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {branch} ({branchStudents.length})
                </Typography>
                <Grid container spacing={2}>
                  {branchStudents.map((student, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {student.name}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => onEditClick(student)}
                              sx={{ 
                                color: '#4F46E5',
                                '&:hover': { bgcolor: '#EEF2FF' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                            <strong>APAAR ID:</strong> {student.apaarId || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                            <strong>Student ID:</strong> {student.studentId}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                            <strong>Email:</strong> {student.email}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                            <strong>Year:</strong> {Number(student.yearOfJoining)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace', display: 'block', mt: 1 }}>
                            {student.address?.slice(0, 10)}...{student.address?.slice(-8)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )}
        </>
      )}
    </Box>
  );
};

// Grade Sheet Upload Dialog Component
const GradeSheetUploadDialog = ({ open, onClose, students, onSuccess }) => {
  const { uploadGradeSheetToBlockchain } = useBlockchain();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please upload PDF or image file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!selectedStudent || !semester || !academicYear || !file) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setUploading(true);
      setProgress(20);

      // Upload file to IPFS
      const fileCID = await uploadFileToIPFS(file);
      setProgress(50);

      // Create metadata
      const metadata = {
        fileCID,
        fileName: file.name,
        semester,
        academicYear,
        uploadDate: new Date().toISOString(),
      };

      // Upload metadata to IPFS
      const metadataCID = await uploadJSONToIPFS(metadata);
      setProgress(70);

      // Upload to blockchain
      await uploadGradeSheetToBlockchain(selectedStudent, metadataCID, semester, academicYear);
      setProgress(100);

      toast.success('Grade sheet uploaded successfully!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error uploading grade sheet:', error);
      toast.error('Failed to upload grade sheet');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setSelectedStudent('');
    setSemester('');
    setAcademicYear('');
    setFile(null);
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Upload Grade Sheet</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Upload grade sheet for a student. The file will be stored on IPFS.
          </Alert>

          <TextField
            select
            fullWidth
            label="Select Student"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            disabled={uploading}
            sx={{ mb: 2 }}
          >
            {students.map((student) => (
              <MenuItem key={student.address} value={student.address}>
                {student.name} ({student.studentId})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="e.g., Semester 1"
            disabled={uploading}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Academic Year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g., 2024-25"
            disabled={uploading}
            sx={{ mb: 3 }}
          />

          <Box
            sx={{
              border: '2px dashed #E5E7EB',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: '#F9FAFB',
              cursor: uploading ? 'not-allowed' : 'pointer',
              '&:hover': {
                borderColor: uploading ? '#E5E7EB' : '#4F46E5',
              },
            }}
            onClick={() => !uploading && document.getElementById('grade-file').click()}
          >
            <input
              id="grade-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <UploadIcon sx={{ fontSize: 48, color: '#9CA3AF', mb: 1 }} />
            <Typography variant="body1" sx={{ color: '#374151' }}>
              {file ? file.name : 'Click to upload file'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              PDF, JPG, PNG (Max 10MB)
            </Typography>
          </Box>

          {uploading && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Uploading... {progress}%
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={uploading} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedStudent || !semester || !academicYear || !file || uploading}
          sx={{
            bgcolor: '#4F46E5',
            textTransform: 'none',
            '&:hover': { bgcolor: '#4338CA' },
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UniversityDashboard = () => {
  const {
    registerStudent,
    updateStudentDetails,
    getUniversityStudents,
    getStudentCertificates,
    getAllStudents,
    approveNonAcademicCertificate,
    rejectNonAcademicCertificate,
    getUniversityApprovalRequests,
    respondToApprovalRequest,
    account,
    disconnectWallet,
  } = useBlockchain();

  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [students, setStudents] = useState([]);
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [gradeSheetDialogOpen, setGradeSheetDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (account) {
      loadData();
    }
  }, [account]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load students
      const studentsList = await getUniversityStudents(account);
      setStudents(studentsList);

      // Load pending certificates from all students
      const allStudents = await getAllStudents();
      const pending = [];
      
      for (const student of allStudents) {
        const certs = await getStudentCertificates(student.address);
        const pendingCerts = certs.filter(
          (cert) => cert.certificateType === 1 && cert.status === 0
        );
        pending.push(...pendingCerts);
      }
      
      setPendingCertificates(pending);

      // Load approval requests
      const requests = await getUniversityApprovalRequests(account);
      setApprovalRequests(requests);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (formData) => {
    try {
      setLoading(true);
      await registerStudent(
        formData.walletAddress,
        formData.name,
        formData.email,
        formData.studentId,
        formData.apaarId,
        formData.yearOfJoining,
        formData.branch
      );
      await loadData();
      setRegistrationDialogOpen(false);
    } catch (error) {
      console.error('Error registering student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setEditModalOpen(true);
  };

  const handleUpdateStudent = async (formData) => {
    try {
      setLoading(true);
      await updateStudentDetails(
        formData.address,
        formData.name,
        formData.email,
        formData.studentId,
        formData.branch,
        parseInt(formData.yearOfJoining)
      );
      await loadData();
      setEditModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCertificate = async (certificate) => {
    try {
      setLoading(true);
      await approveNonAcademicCertificate(certificate.hash);
      await loadData();
    } catch (error) {
      console.error('Error approving certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCertificate = async (certificate) => {
    try {
      setLoading(true);
      await rejectNonAcademicCertificate(certificate.hash);
      await loadData();
    } catch (error) {
      console.error('Error rejecting certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCompany = async (request) => {
    try {
      setLoading(true);
      await respondToApprovalRequest(request.hash, true);
      await loadData();
    } catch (error) {
      console.error('Error approving company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCompany = async (request) => {
    try {
      setLoading(true);
      await respondToApprovalRequest(request.hash, false);
      await loadData();
    } catch (error) {
      console.error('Error rejecting company:', error);
    } finally {
      setLoading(false);
    }
  };

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
              BlockVerify - University Portal
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
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Students" />
            <Tab icon={<DocumentIcon />} iconPosition="start" label="Academic Records" />
            <Tab icon={<VerifiedIcon />} iconPosition="start" label="Verification Center" />
            <Tab icon={<BusinessIcon />} iconPosition="start" label="Companies" />
          </Tabs>
        </Paper>

        {/* Tab 0: Dashboard */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              University Dashboard
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                      Total Students
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                      {students.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                      Pending Verifications
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                      {pendingCertificates.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                      Company Requests
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#4F46E5' }}>
                      {approvalRequests.filter(r => !r.isApproved && !r.isRejected).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                      Approved Companies
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#10B981' }}>
                      {approvalRequests.filter(r => r.isApproved).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setRegistrationDialogOpen(true)}
                    sx={{
                      bgcolor: '#4F46E5',
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': { bgcolor: '#4338CA' },
                    }}
                  >
                    Register Student
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setGradeSheetDialogOpen(true)}
                    sx={{
                      borderColor: '#E5E7EB',
                      color: '#374151',
                      textTransform: 'none',
                      py: 1.5,
                    }}
                  >
                    Upload Grade Sheet
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setTabValue(3)}
                    sx={{
                      borderColor: '#E5E7EB',
                      color: '#374151',
                      textTransform: 'none',
                      py: 1.5,
                    }}
                  >
                    Verify Certificates
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setTabValue(4)}
                    sx={{
                      borderColor: '#E5E7EB',
                      color: '#374151',
                      textTransform: 'none',
                      py: 1.5,
                    }}
                  >
                    Approve Companies
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Tab 1: Students */}
        {tabValue === 1 && (
          <StudentManagementTab
            students={students}
            onRegisterClick={() => setRegistrationDialogOpen(true)}
            onEditClick={handleEditStudent}
          />
        )}

        {/* Tab 2: Academic Records */}
        {tabValue === 2 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                Academic Records
              </Typography>
              <Button
                variant="contained"
                onClick={() => setGradeSheetDialogOpen(true)}
                sx={{
                  bgcolor: '#4F46E5',
                  textTransform: 'none',
                  px: 3,
                  '&:hover': { bgcolor: '#4338CA' },
                }}
              >
                Upload Grade Sheet
              </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4 }}>
              <Typography variant="body1" sx={{ color: '#6B7280', mb: 2 }}>
                Upload grade sheets for your students. Grade sheets are automatically verified and accessible to students.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setGradeSheetDialogOpen(true)}
                sx={{
                  borderColor: '#4F46E5',
                  color: '#4F46E5',
                  textTransform: 'none',
                }}
              >
                Upload Grade Sheet
              </Button>
            </Paper>
          </Box>
        )}

        {/* Tab 3: Verification Center */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              Certificate Verification Center
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Pending Verification ({pendingCertificates.length})
            </Typography>

            {pendingCertificates.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 6, textAlign: 'center' }}>
                <VerifiedIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                  No certificates pending verification
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  All student-uploaded certificates have been reviewed
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {pendingCertificates.map((cert, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <VerificationQueueCard
                      certificate={cert}
                      onApprove={handleApproveCertificate}
                      onReject={handleRejectCertificate}
                      loading={loading}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 4: Companies */}
        {tabValue === 4 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              Company Management
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Pending Approval ({approvalRequests.filter(r => !r.isApproved && !r.isRejected).length})
            </Typography>

            {approvalRequests.filter(r => !r.isApproved && !r.isRejected).length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 6, textAlign: 'center', mb: 4 }}>
                <BusinessIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                  No pending company requests
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Companies will appear here when they request access
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {approvalRequests
                  .filter(r => !r.isApproved && !r.isRejected)
                  .map((request, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {request.verifierName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                            {request.message}
                          </Typography>
                          <Box display="flex" gap={2}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => handleApproveCompany(request)}
                              disabled={loading}
                              sx={{
                                bgcolor: '#10B981',
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#059669' },
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() => handleRejectCompany(request)}
                              disabled={loading}
                              sx={{
                                borderColor: '#EF4444',
                                color: '#EF4444',
                                textTransform: 'none',
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            )}

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Approved Companies ({approvalRequests.filter(r => r.isApproved).length})
            </Typography>
            <Grid container spacing={3}>
              {approvalRequests
                .filter(r => r.isApproved)
                .map((request, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {request.verifierName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#10B981' }}>
                          ✓ Approved
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Student Registration Dialog */}
      <Dialog open={registrationDialogOpen} onClose={() => setRegistrationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Register Student</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <StudentRegistrationForm onSubmit={handleRegisterStudent} loading={loading} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grade Sheet Upload Dialog */}
      <GradeSheetUploadDialog
        open={gradeSheetDialogOpen}
        onClose={() => setGradeSheetDialogOpen(false)}
        students={students}
        onSuccess={loadData}
      />

      {/* Student Edit Modal */}
      <StudentEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSubmit={handleUpdateStudent}
      />
    </Box>
  );
};

export default UniversityDashboard;
