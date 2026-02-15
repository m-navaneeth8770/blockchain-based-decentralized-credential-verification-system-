import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';

const CertificateSelectionModal = ({ 
  open, 
  onClose, 
  request, 
  certificates,
  gradeSheets,
  onApprove, 
  onReject,
  loading 
}) => {
  const [selectedCerts, setSelectedCerts] = useState([]);

  const handleToggleCert = (certHash) => {
    setSelectedCerts(prev => 
      prev.includes(certHash) 
        ? prev.filter(h => h !== certHash)
        : [...prev, certHash]
    );
  };

  const handleApprove = () => {
    onApprove(request, selectedCerts);
    setSelectedCerts([]);
  };

  const handleReject = () => {
    onReject(request);
    setSelectedCerts([]);
  };

  const handleClose = () => {
    setSelectedCerts([]);
    onClose();
  };

  // Filter only verified certificates (status === 1 means APPROVED)
  // Also show pending certificates (status === 0) so students can share them
  const verifiedCerts = certificates.filter(cert => {
    console.log('Certificate:', cert.certificateName, 'Status:', cert.status);
    return cert.status === 1 || cert.status === 0; // APPROVED or PENDING
  });
  
  // Filter grade sheets (all visible grade sheets)
  const availableGradeSheets = gradeSheets?.filter(sheet => sheet.isVisible !== false) || [];
  
  console.log('Total certificates:', certificates.length);
  console.log('Verified/Pending certificates:', verifiedCerts.length);
  console.log('Available grade sheets:', availableGradeSheets.length);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DocumentIcon sx={{ color: '#4F46E5', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Certificate Access Request
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {request?.companyName || 'Company'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>{request?.companyName || 'This company'}</strong> is requesting access to your documents.
          {request?.message && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Message: "{request.message}"
            </Typography>
          )}
        </Alert>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Select Documents to Share
        </Typography>

        {verifiedCerts.length === 0 && availableGradeSheets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DocumentIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#6B7280' }}>
              No documents available to share
            </Typography>
          </Box>
        ) : (
          <FormGroup>
            {/* Grade Sheets Section */}
            {availableGradeSheets.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 1, color: '#92400E' }}>
                  📚 Grade Sheets ({availableGradeSheets.length})
                </Typography>
                {availableGradeSheets.map((sheet, index) => (
                  <Box 
                    key={`sheet-${sheet.hash || index}`}
                    sx={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 2,
                      p: 2,
                      mb: 2,
                      bgcolor: selectedCerts.includes(sheet.hash) ? '#FFFBEB' : 'white',
                      '&:hover': {
                        borderColor: '#F59E0B',
                      },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCerts.includes(sheet.hash)}
                          onChange={() => handleToggleCert(sheet.hash)}
                          sx={{
                            color: '#F59E0B',
                            '&.Mui-checked': {
                              color: '#F59E0B',
                            },
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {sheet.semester || 'Grade Sheet'} - {sheet.academicYear || 'Academic Year'}
                          </Typography>
                          <Box display="flex" gap={1} mt={0.5}>
                            <Chip
                              label="Grade Sheet"
                              size="small"
                              sx={{
                                bgcolor: '#FEF3C7',
                                color: '#92400E',
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
              </>
            )}

            {/* Certificates Section */}
            {verifiedCerts.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#4F46E5' }}>
                  🎓 Certificates ({verifiedCerts.length})
                </Typography>
                {verifiedCerts.map((cert, index) => (
                  <Box 
                    key={cert.hash || index}
                    sx={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 2,
                      p: 2,
                      mb: 2,
                      bgcolor: selectedCerts.includes(cert.hash) ? '#F0F9FF' : 'white',
                      '&:hover': {
                        borderColor: '#4F46E5',
                      },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCerts.includes(cert.hash)}
                          onChange={() => handleToggleCert(cert.hash)}
                          sx={{
                            color: '#4F46E5',
                            '&.Mui-checked': {
                              color: '#4F46E5',
                            },
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {cert.certificateName}
                          </Typography>
                          <Box display="flex" gap={1} mt={0.5}>
                            <Chip
                              label={cert.certificateType === 0 ? 'Academic' : 'Professional'}
                              size="small"
                              sx={{
                                bgcolor: cert.certificateType === 0 ? '#EEF2FF' : '#F0FDF4',
                                color: cert.certificateType === 0 ? '#4F46E5' : '#065F46',
                                fontSize: '0.75rem',
                              }}
                            />
                            <Chip
                              label={cert.status === 1 ? 'Verified' : cert.status === 0 ? 'Pending' : 'Rejected'}
                              size="small"
                              sx={{
                                bgcolor: cert.status === 1 ? '#ECFDF5' : cert.status === 0 ? '#FEF3C7' : '#FEE2E2',
                                color: cert.status === 1 ? '#065F46' : cert.status === 0 ? '#92400E' : '#991B1B',
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </>
            )}
          </FormGroup>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
            <strong>Selected:</strong> {selectedCerts.length} document(s)
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            You can approve without selecting documents, or select specific ones to share immediately.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={handleReject}
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
          Reject Request
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<CheckIcon />}
          onClick={handleApprove}
          disabled={loading}
          sx={{
            bgcolor: '#10B981',
            textTransform: 'none',
            borderRadius: 2,
            '&:hover': { bgcolor: '#059669' },
          }}
        >
          Approve & Share ({selectedCerts.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CertificateSelectionModal;
