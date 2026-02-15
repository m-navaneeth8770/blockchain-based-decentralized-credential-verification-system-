import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const ViewNotification = ({ notification }) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        mb: 2,
        bgcolor: notification.isNew ? '#F0F9FF' : 'white',
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ViewIcon sx={{ color: '#4F46E5', fontSize: 20 }} />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {notification.companyName || 'A company'} viewed your document
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <DocumentIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                {notification.documentName || 'Document'}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.5 }}>
              {notification.viewedAt
                ? formatDistanceToNow(new Date(Number(notification.viewedAt) * 1000), {
                    addSuffix: true,
                  })
                : 'Recently'}
            </Typography>
          </Box>
          {notification.isNew && (
            <Chip
              label="New"
              size="small"
              sx={{
                bgcolor: '#4F46E5',
                color: 'white',
                fontWeight: 600,
                height: 24,
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ViewNotification;
