import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
} from '@mui/icons-material';

const RegistrationRequestsPanel = ({ requests, onApprove, onReject, loading }) => {
  if (requests.length === 0) {
    return (
      <Alert severity="info">
        No pending registration requests
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {requests.map((request, index) => (
        <Grid item xs={12} key={request.hash || index}>
          <Card elevation={0} sx={{ border: '2px solid #F59E0B', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="flex-start" gap={3}>
                {/* Icon */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: request.entityType === 'university' ? '#EEF2FF' : '#F0FDF4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {request.entityType === 'university' ? (
                    <SchoolIcon sx={{ fontSize: 32, color: '#4F46E5' }} />
                  ) : (
                    <BusinessIcon sx={{ fontSize: 32, color: '#10B981' }} />
                  )}
                </Box>

                {/* Content */}
                <Box flexGrow={1}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {request.name}
                    </Typography>
                    <Chip
                      label={request.entityType === 'university' ? 'University' : 'Company'}
                      size="small"
                      sx={{
                        bgcolor: request.entityType === 'university' ? '#EEF2FF' : '#F0FDF4',
                        color: request.entityType === 'university' ? '#4F46E5' : '#10B981',
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                        Registration Number
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        {request.registrationNumber}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                        <EmailIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {request.email}
                      </Typography>

                      {request.website && (
                        <>
                          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                            <WebsiteIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            Website
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <a href={request.website} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5' }}>
                              {request.website}
                            </a>
                          </Typography>
                        </>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                        Contact Person
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        {request.contactPerson}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                        <PhoneIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {request.phoneNumber}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                        Wallet Address
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                        {request.walletAddress}
                      </Typography>
                    </Grid>
                  </Grid>

                  {request.description && (
                    <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {request.description}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Requested: {new Date(request.requestedAt * 1000).toLocaleString()}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box display="flex" flexDirection="column" gap={1} flexShrink={0}>
                  <Button
                    variant="contained"
                    startIcon={<ApproveIcon />}
                    onClick={() => onApprove(request.hash)}
                    disabled={loading}
                    sx={{
                      bgcolor: '#10B981',
                      textTransform: 'none',
                      minWidth: 120,
                      '&:hover': { bgcolor: '#059669' },
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RejectIcon />}
                    onClick={() => onReject(request.hash)}
                    disabled={loading}
                    sx={{
                      borderColor: '#EF4444',
                      color: '#EF4444',
                      textTransform: 'none',
                      minWidth: 120,
                      '&:hover': {
                        borderColor: '#DC2626',
                        bgcolor: '#FEE2E2',
                      },
                    }}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default RegistrationRequestsPanel;
