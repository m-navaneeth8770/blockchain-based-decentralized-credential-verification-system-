import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  AdminPanelSettings as AdminIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

const AdminDashboard = () => {
  const {
    registerUniversity,
    registerVerifier,
    getAllUniversities,
    getAllVerifiers,
    getPendingRegistrationRequests,
    approveRegistrationRequest,
    rejectRegistrationRequest,
    account,
    disconnectWallet,
  } = useBlockchain();

  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [universities, setUniversities] = useState([]);
  const [verifiers, setVerifiers] = useState([]);
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [universityDialogOpen, setUniversityDialogOpen] = useState(false);
  const [verifierDialogOpen, setVerifierDialogOpen] = useState(false);

  const [universityForm, setUniversityForm] = useState({
    address: '',
    name: '',
    registrationNumber: '',
    email: '',
  });

  const [verifierForm, setVerifierForm] = useState({
    address: '',
    companyName: '',
    registrationNumber: '',
    email: '',
  });

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

      const vers = await getAllVerifiers();
      setVerifiers(vers);
      
      const requests = await getPendingRegistrationRequests();
      setRegistrationRequests(requests);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestHash) => {
    try {
      setLoading(true);
      await approveRegistrationRequest(requestHash);
      await loadData();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestHash) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      setLoading(true);
      await rejectRegistrationRequest(requestHash, reason || 'Request rejected');
      await loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUniversity = async () => {
    if (!ethers.isAddress(universityForm.address)) {
      alert('Invalid Ethereum address');
      return;
    }

    try {
      setLoading(true);
      const checksumAddress = ethers.getAddress(universityForm.address);
      await registerUniversity(
        checksumAddress,
        universityForm.name,
        universityForm.registrationNumber,
        universityForm.email
      );
      setUniversityDialogOpen(false);
      setUniversityForm({ address: '', name: '', registrationNumber: '', email: '' });
      await loadData();
    } catch (error) {
      console.error('Error registering university:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVerifier = async () => {
    if (!ethers.isAddress(verifierForm.address)) {
      alert('Invalid Ethereum address');
      return;
    }

    try {
      setLoading(true);
      const checksumAddress = ethers.getAddress(verifierForm.address);
      await registerVerifier(
        checksumAddress,
        verifierForm.companyName,
        verifierForm.registrationNumber,
        verifierForm.email
      );
      setVerifierDialogOpen(false);
      setVerifierForm({ address: '', companyName: '', registrationNumber: '', email: '' });
      await loadData();
    } catch (error) {
      console.error('Error registering verifier:', error);
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
              <AdminIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700 }}>
              BlockVerify - Admin Portal
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
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
          System Administration
        </Typography>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                  Total Universities
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                  {universities.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                  Total Companies
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                  {verifiers.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #F59E0B', borderRadius: 3, bgcolor: '#FFFBEB' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#92400E', mb: 1 }}>
                  Pending Requests
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#92400E' }}>
                  {registrationRequests.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
            <Tab icon={<BusinessIcon />} iconPosition="start" label="Companies" />
            <Tab 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  Registration Requests
                  {registrationRequests.length > 0 && (
                    <Chip 
                      label={registrationRequests.length} 
                      size="small" 
                      sx={{ bgcolor: '#F59E0B', color: 'white', height: 20, minWidth: 20 }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {/* Universities Section */}
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 3, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Universities
            </Typography>
            <Button
              variant="contained"
              startIcon={<SchoolIcon />}
              onClick={() => setUniversityDialogOpen(true)}
              sx={{
                bgcolor: '#4F46E5',
                textTransform: 'none',
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              Register University
            </Button>
          </Box>

          {universities.length === 0 ? (
            <Alert severity="info">No universities registered yet</Alert>
          ) : (
            <Grid container spacing={2}>
              {universities.map((uni, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {uni.name || uni[0] || 'University'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Reg No:</strong> {uni.registrationNumber || uni[1] || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Email:</strong> {uni.email || uni[2] || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace', display: 'block' }}>
                        {uni.address}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Verifiers Section */}
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Companies / Verifiers
            </Typography>
            <Button
              variant="contained"
              startIcon={<BusinessIcon />}
              onClick={() => setVerifierDialogOpen(true)}
              sx={{
                bgcolor: '#4F46E5',
                textTransform: 'none',
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              Register Company
            </Button>
          </Box>

          {verifiers.length === 0 ? (
            <Alert severity="info">No companies registered yet</Alert>
          ) : (
            <Grid container spacing={2}>
              {verifiers.map((ver, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {ver.companyName || ver[0] || 'Company'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Reg No:</strong> {ver.registrationNumber || ver[1] || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Email:</strong> {ver.email || ver[2] || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace', display: 'block' }}>
                        {ver.address}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>

      {/* University Registration Dialog */}
      <Dialog open={universityDialogOpen} onClose={() => setUniversityDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Register University</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Wallet Address"
              value={universityForm.address}
              onChange={(e) => setUniversityForm({ ...universityForm, address: e.target.value })}
              margin="normal"
              placeholder="0x..."
              required
            />
            <TextField
              fullWidth
              label="University Name"
              value={universityForm.name}
              onChange={(e) => setUniversityForm({ ...universityForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Registration Number"
              value={universityForm.registrationNumber}
              onChange={(e) => setUniversityForm({ ...universityForm, registrationNumber: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={universityForm.email}
              onChange={(e) => setUniversityForm({ ...universityForm, email: e.target.value })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUniversityDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleRegisterUniversity}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#4F46E5',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4338CA' },
            }}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verifier Registration Dialog */}
      <Dialog open={verifierDialogOpen} onClose={() => setVerifierDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Register Company</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Wallet Address"
              value={verifierForm.address}
              onChange={(e) => setVerifierForm({ ...verifierForm, address: e.target.value })}
              margin="normal"
              placeholder="0x..."
              required
            />
            <TextField
              fullWidth
              label="Company Name"
              value={verifierForm.companyName}
              onChange={(e) => setVerifierForm({ ...verifierForm, companyName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Registration Number"
              value={verifierForm.registrationNumber}
              onChange={(e) => setVerifierForm({ ...verifierForm, registrationNumber: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={verifierForm.email}
              onChange={(e) => setVerifierForm({ ...verifierForm, email: e.target.value })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setVerifierDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleRegisterVerifier}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#4F46E5',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4338CA' },
            }}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
