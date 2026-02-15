import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import {
  School as SchoolIcon,
  Business as BusinessIcon,
  Send as SendIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

const RegistrationRequestForm = ({ onSubmit, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    entityType: '',
    name: '',
    registrationNumber: '',
    email: '',
    contactPerson: '',
    phoneNumber: '',
    website: '',
    description: '',
    walletAddress: '',
  });

  const [errors, setErrors] = useState({});

  const steps = ['Entity Type', 'Basic Information', 'Contact Details', 'Review & Submit'];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.entityType) newErrors.entityType = 'Please select entity type';
    }

    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    }

    if (step === 2) {
      if (!formData.contactPerson) newErrors.contactPerson = 'Contact person is required';
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.walletAddress) newErrors.walletAddress = 'Wallet address is required';
      else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
        newErrors.walletAddress = 'Invalid Ethereum address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
      setErrors({ submit: error.message || 'Failed to submit request' });
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setFormData({
          ...formData,
          walletAddress: accounts[0],
        });
        setErrors({
          ...errors,
          walletAddress: '',
        });
      } else {
        setErrors({
          ...errors,
          walletAddress: 'MetaMask is not installed',
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        walletAddress: 'Failed to connect wallet',
      });
    }
  };

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ border: '2px solid #10B981', borderRadius: 3, p: 6, textAlign: 'center' }}>
          <SuccessIcon sx={{ fontSize: 80, color: '#10B981', mb: 3 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
            Request Submitted Successfully!
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
            Your registration request has been submitted to the system administrator.
            You will receive a notification once your request is reviewed.
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>What's Next?</strong>
            <br />
            • Admin will review your request within 24-48 hours
            <br />
            • You'll receive an email notification about the decision
            <br />
            • Once approved, you can access the system with your wallet
          </Alert>
          <Button
            variant="contained"
            onClick={onCancel}
            sx={{
              bgcolor: '#4F46E5',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              '&:hover': { bgcolor: '#4338CA' },
            }}
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
          Registration Request
        </Typography>
        <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
          Submit your details to request access to the BlockVerify system
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Step 0: Entity Type */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Select Entity Type
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  onClick={() => handleChange('entityType')({ target: { value: 'university' } })}
                  sx={{
                    border: formData.entityType === 'university' ? '2px solid #4F46E5' : '2px solid #E5E7EB',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#4F46E5',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)',
                    },
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 64, color: '#4F46E5', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    University
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Educational institution that issues academic credentials
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  onClick={() => handleChange('entityType')({ target: { value: 'verifier' } })}
                  sx={{
                    border: formData.entityType === 'verifier' ? '2px solid #4F46E5' : '2px solid #E5E7EB',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#4F46E5',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)',
                    },
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 64, color: '#10B981', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Company/Verifier
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Organization that verifies student credentials
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            {errors.entityType && (
              <Typography variant="caption" sx={{ color: '#EF4444', mt: 1, display: 'block' }}>
                {errors.entityType}
              </Typography>
            )}
          </Box>
        )}

        {/* Step 1: Basic Information */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={formData.entityType === 'university' ? 'University Name' : 'Company Name'}
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="e.g., Stanford University or TCS Ltd."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  value={formData.registrationNumber}
                  onChange={handleChange('registrationNumber')}
                  error={!!errors.registrationNumber}
                  helperText={errors.registrationNumber}
                  placeholder="Official registration number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Official Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="admin@organization.edu"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={handleChange('website')}
                  placeholder="https://www.organization.edu"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 2: Contact Details */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Contact Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person Name"
                  value={formData.contactPerson}
                  onChange={handleChange('contactPerson')}
                  error={!!errors.contactPerson}
                  helperText={errors.contactPerson}
                  placeholder="Full name of authorized person"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  placeholder="+1 234 567 8900"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Wallet Address"
                  value={formData.walletAddress}
                  onChange={handleChange('walletAddress')}
                  error={!!errors.walletAddress}
                  helperText={errors.walletAddress || 'Ethereum wallet address for blockchain access'}
                  placeholder="0x..."
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={connectWallet}
                        sx={{
                          textTransform: 'none',
                          minWidth: 'auto',
                        }}
                      >
                        Connect Wallet
                      </Button>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Brief description of your organization and why you need access..."
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 3: Review */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Review Your Information
            </Typography>
            <Paper elevation={0} sx={{ bgcolor: '#F9FAFB', p: 3, borderRadius: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Entity Type</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {formData.entityType === 'university' ? 'University' : 'Company/Verifier'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {formData.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Registration Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.registrationNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Email</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Contact Person</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.contactPerson}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Phone</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.phoneNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>Wallet Address</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {formData.walletAddress}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            <Alert severity="info">
              By submitting this request, you confirm that all information provided is accurate and you are authorized to represent this organization.
            </Alert>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={activeStep === 0 ? onCancel : handleBack}
            sx={{
              textTransform: 'none',
              color: '#6B7280',
            }}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
            startIcon={activeStep === steps.length - 1 ? <SendIcon /> : null}
            sx={{
              bgcolor: '#4F46E5',
              textTransform: 'none',
              px: 4,
              '&:hover': { bgcolor: '#4338CA' },
            }}
          >
            {loading ? 'Submitting...' : activeStep === steps.length - 1 ? 'Submit Request' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegistrationRequestForm;
