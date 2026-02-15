import React from 'react';
import { Box, Card, CardContent, Typography, Paper } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { School as SchoolIcon } from '@mui/icons-material';

const APAARCard = ({ studentProfile }) => {
  if (!studentProfile) return null;

  return (
    <Card
      elevation={0}
      sx={{
        border: '2px solid #4F46E5',
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        maxWidth: 500,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <SchoolIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            APAAR ID Card
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            p: 3,
            mb: 2,
            textAlign: 'center',
          }}
        >
          <QRCodeSVG
            value={studentProfile.apaarId || 'N/A'}
            size={150}
            level="H"
            includeMargin={true}
          />
        </Box>

        <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
            APAAR ID
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {studentProfile.apaarId || 'Not Assigned'}
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
            Student Name
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
            {studentProfile.name}
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
            Student ID
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {studentProfile.studentId}
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
            Branch
          </Typography>
          <Typography variant="body2">
            {studentProfile.branch}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default APAARCard;
