import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Link,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  OpenInNew as OpenIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const VerificationQueueCard = ({ certificate, onApprove, onReject, loading }) => {
  // Parse metadata if it's a string
  let metadata = {};
  try {
    metadata = typeof certificate.metadata === 'string' 
      ? JSON.parse(certificate.metadata) 
      : certificate.metadata || {};
  } catch (error) {
    console.error('Error parsing metadata:', error);
  }

  const isAutoVerified = metadata.autoVerified || false;
  const verificationResult = metadata.verificationResult || {};
  const platform = metadata.platform || metadata.organization;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #E5E7EB',
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
              bgcolor: isAutoVerified ? '#ECFDF5' : '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DocumentIcon 
              sx={{ 
                color: isAutoVerified ? '#10B981' : '#F59E0B', 
                fontSize: 24 
              }} 
            />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {certificate.certificateName || metadata.certificateName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              Organization: {platform || 'Unknown'}
            </Typography>
            {isAutoVerified && (
              <Chip
                label="Auto-Verified ✓"
                size="small"
                sx={{
                  bgcolor: '#ECFDF5',
                  color: '#065F46',
                  fontWeight: 600,
                  mb: 1,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Student Info */}
        <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2, p: 2, mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
            Student Information:
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Address:</strong> {certificate.studentAddress?.slice(0, 10)}...
          </Typography>
          <Typography variant="body2">
            <strong>Uploaded:</strong>{' '}
            {certificate.issueDate
              ? formatDistanceToNow(new Date(Number(certificate.issueDate) * 1000), {
                  addSuffix: true,
                })
              : 'Recently'}
          </Typography>
        </Box>

        {/* Verification Details */}
        {metadata.certificateUrl && (
          <Box mb={2}>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
              Verification URL:
            </Typography>
            <Link
              href={metadata.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#4F46E5',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <Typography variant="body2" noWrap>
                {metadata.certificateUrl}
              </Typography>
              <OpenIcon sx={{ fontSize: 16 }} />
            </Link>
          </Box>
        )}

        {/* Verification Result */}
        {verificationResult.message && (
          <Box mb={2}>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
              Verification Status:
            </Typography>
            <Typography variant="body2" sx={{ color: isAutoVerified ? '#10B981' : '#F59E0B' }}>
              {verificationResult.message}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        {certificate.status === 0 && (
          <Box display="flex" gap={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ApproveIcon />}
              onClick={() => onApprove(certificate)}
              disabled={loading}
              sx={{
                bgcolor: '#10B981',
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { bgcolor: '#059669' },
              }}
            >
              Approve
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RejectIcon />}
              onClick={() => onReject(certificate)}
              disabled={loading}
              sx={{
                borderColor: '#EF4444',
                color: '#EF4444',
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#DC2626',
                  bgcolor: '#FEE2E2',
                },
              }}
            >
              Reject
            </Button>
          </Box>
        )}

        {certificate.status === 1 && (
          <Chip
            label="Approved"
            sx={{
              bgcolor: '#ECFDF5',
              color: '#065F46',
              fontWeight: 600,
            }}
          />
        )}

        {certificate.status === 2 && (
          <Chip
            label="Rejected"
            sx={{
              bgcolor: '#FEE2E2',
              color: '#991B1B',
              fontWeight: 600,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationQueueCard;
