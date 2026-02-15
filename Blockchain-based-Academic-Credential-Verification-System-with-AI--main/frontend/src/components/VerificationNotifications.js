import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';

const VerificationNotifications = ({ studentAddress }) => {
  const { getStudentVerificationNotifications, getDocumentVerification, contract } = useBlockchain();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [studentAddress]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationHashes = await getStudentVerificationNotifications(studentAddress);
      
      // For now, we'll show a simple count
      // In a full implementation, you'd decode the notification hashes
      // and fetch the verification details
      
      setNotifications(notificationHashes || []);
    } catch (error) {
      console.error('Error loading verification notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 4, textAlign: 'center' }}>
        <DocumentIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
          No Verification Updates
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          Companies will notify you here after reviewing your documents
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        You have {notifications.length} verification notification{notifications.length !== 1 ? 's' : ''}
      </Alert>
      
      <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', p: 3 }}>
        Verification details will be displayed here. Check back after companies review your documents.
      </Typography>
    </Box>
  );
};

export default VerificationNotifications;
