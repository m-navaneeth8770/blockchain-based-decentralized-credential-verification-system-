import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const AccessRequestCard = ({ request, onApprove, onReject, loading }) => {
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
              bgcolor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BusinessIcon sx={{ color: '#4F46E5', fontSize: 24 }} />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {request.companyName || 'Company'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              {request.message || 'Requesting access to your documents'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              {request.requestedAt
                ? formatDistanceToNow(new Date(Number(request.requestedAt) * 1000), {
                    addSuffix: true,
                  })
                : 'Recently'}
            </Typography>
          </Box>
        </Box>

        {request.status === 'pending' && (
          <Box display="flex" gap={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ApproveIcon />}
              onClick={() => onApprove(request)}
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
              onClick={() => onReject(request)}
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

        {request.status === 'approved' && (
          <Chip
            label="Access Granted"
            size="small"
            sx={{
              bgcolor: '#ECFDF5',
              color: '#065F46',
              fontWeight: 600,
            }}
          />
        )}

        {request.status === 'rejected' && (
          <Chip
            label="Access Rejected"
            size="small"
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

export default AccessRequestCard;
