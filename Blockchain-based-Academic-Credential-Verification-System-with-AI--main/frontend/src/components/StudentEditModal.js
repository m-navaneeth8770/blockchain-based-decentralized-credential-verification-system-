import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const StudentEditModal = ({ 
  open, 
  onClose, 
  student,
  onSubmit,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    branch: '',
    yearOfJoining: '',
  });
  
  // OTP data
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    if (student && open) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        studentId: student.studentId || '',
        branch: student.branch || '',
        yearOfJoining: student.yearOfJoining?.toString() || '',
      });
      setActiveStep(0);
      setOtpSent(false);
      setOtpVerified(false);
      setOtp('');
      setError('');
    }
  }, [student, open]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError('');
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Send OTP to student's email
      const response = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          studentName: formData.name,
          purpose: 'student_edit_verification',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setOtpSent(true);
        setActiveStep(1);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send OTP. Please check if the email service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpVerified(true);
        setActiveStep(2);
        // Submit the changes
        await handleSubmitChanges();
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitChanges = async () => {
    setLoading(true);
    try {
      await onSubmit({
        address: student.address,
        ...formData,
      });
      // Success handled by parent
    } catch (err) {
      setError('Failed to update student details');
      setLoading(false);
    }
  };

  const steps = ['Edit Details', 'Verify Email', 'Confirm'];

  const hasChanges = () => {
    if (!student) return false;
    
    return (
      formData.name !== student.name ||
      formData.email !== student.email ||
      formData.studentId !== student.studentId ||
      formData.branch !== student.branch ||
      formData.yearOfJoining !== student.yearOfJoining?.toString()
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon sx={{ color: '#4F46E5' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Edit Student Details
            </Typography>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 'auto' }}>
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step 1: Edit Form */}
        {activeStep === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Edit the student details below. An OTP will be sent to the student's email for verification.
            </Alert>

            <TextField
              fullWidth
              label="Student Name"
              value={formData.name}
              onChange={handleChange('name')}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              sx={{ mb: 2 }}
              required
              helperText="OTP will be sent to this email"
            />

            <TextField
              fullWidth
              label="Student ID"
              value={formData.studentId}
              onChange={handleChange('studentId')}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Branch"
              value={formData.branch}
              onChange={handleChange('branch')}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Year of Joining"
              type="number"
              value={formData.yearOfJoining}
              onChange={handleChange('yearOfJoining')}
              sx={{ mb: 3 }}
              required
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOTP}
              disabled={loading || !hasChanges()}
              startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
              sx={{
                bgcolor: '#4F46E5',
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP to Student'}
            </Button>

            {!hasChanges() && (
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', textAlign: 'center', mt: 1 }}>
                Make changes to enable OTP sending
              </Typography>
            )}
          </Box>
        )}

        {/* Step 2: OTP Verification */}
        {activeStep === 1 && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              OTP has been sent to {formData.email}
            </Alert>

            <Typography variant="body2" sx={{ mb: 2, color: '#6B7280' }}>
              Please ask the student to check their email and provide the 6-digit OTP code.
            </Typography>

            <TextField
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              placeholder="000000"
              inputProps={{ 
                maxLength: 6,
                style: { fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem' }
              }}
              sx={{ mb: 3 }}
            />

            <Box display="flex" gap={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleSendOTP}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  borderColor: '#E5E7EB',
                  color: '#6B7280',
                }}
              >
                Resend OTP
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                sx={{
                  bgcolor: '#10B981',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#059669' },
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Update'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Success */}
        {activeStep === 2 && (
          <Box textAlign="center" py={4}>
            <CheckIcon sx={{ fontSize: 80, color: '#10B981', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Student Details Updated!
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              The changes have been verified and saved to the blockchain.
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                bgcolor: '#4F46E5',
                textTransform: 'none',
                px: 4,
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              Close
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentEditModal;
