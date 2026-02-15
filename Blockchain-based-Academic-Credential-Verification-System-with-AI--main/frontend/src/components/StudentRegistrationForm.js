import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PersonAdd as AddIcon } from '@mui/icons-material';
import { ethers } from 'ethers';

const StudentRegistrationForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    walletAddress: '',
    apaarId: '',
    name: '',
    email: '',
    studentId: '',
    yearOfJoining: new Date().getFullYear(),
    branch: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.walletAddress) {
      newErrors.walletAddress = 'Wallet address is required';
    } else if (!ethers.isAddress(formData.walletAddress)) {
      newErrors.walletAddress = 'Invalid Ethereum address';
    }

    if (!formData.apaarId) {
      newErrors.apaarId = 'APAAR ID is required';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.studentId) {
      newErrors.studentId = 'Student ID is required';
    }

    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await onSubmit(formData);
        // Reset form on success
        setFormData({
          walletAddress: '',
          apaarId: '',
          name: '',
          email: '',
          studentId: '',
          yearOfJoining: new Date().getFullYear(),
          branch: '',
        });
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Register a single student with their government-issued APAAR ID
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Wallet Address"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleChange}
            error={!!errors.walletAddress}
            helperText={errors.walletAddress || 'Student\'s Ethereum wallet address'}
            required
            placeholder="0x..."
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="APAAR ID"
            name="apaarId"
            value={formData.apaarId}
            onChange={handleChange}
            error={!!errors.apaarId}
            helperText={errors.apaarId || 'Government-issued APAAR ID'}
            required
            placeholder="APAAR-2024-12345"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Student Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
            placeholder="John Doe"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            required
            placeholder="student@university.edu"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Student ID / Roll Number"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            error={!!errors.studentId}
            helperText={errors.studentId}
            required
            placeholder="CS2024001"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Year of Joining"
            name="yearOfJoining"
            type="number"
            value={formData.yearOfJoining}
            onChange={handleChange}
            required
            inputProps={{ min: 2000, max: 2100 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Branch / Department"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            error={!!errors.branch}
            helperText={errors.branch}
            required
            placeholder="Computer Science"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{
              bgcolor: '#4F46E5',
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': { bgcolor: '#4338CA' },
            }}
          >
            {loading ? 'Registering...' : 'Register Student'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentRegistrationForm;
