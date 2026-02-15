import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getFileCID, getIPFSUrl } from '../utils/ipfs';

const DocumentViewerModal = ({ 
  open, 
  onClose, 
  document, 
  studentAddress,
  onSubmitVerification,
  loading = false,
}) => {
  const [verificationStatus, setVerificationStatus] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(true);

  useEffect(() => {
    if (open && document) {
      loadPdfUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, document]);

  const loadPdfUrl = async () => {
    setLoadingPdf(true);
    try {
      if (!document) {
        setPdfUrl('');
        return;
      }
      
      const ipfsHash = document.ipfsHash || document.fileCID;
      console.log('Loading document with IPFS hash:', ipfsHash);
      
      // Get the actual file CID (handles both metadata and direct files)
      const fileCID = await getFileCID(ipfsHash);
      console.log('Resolved file CID:', fileCID);
      
      // Get the IPFS URL
      const url = getIPFSUrl(fileCID);
      console.log('PDF URL:', url);
      
      setPdfUrl(url);
    } catch (error) {
      console.error('Error loading PDF URL:', error);
      // Fallback to direct hash
      const ipfsHash = document.ipfsHash || document.fileCID;
      setPdfUrl(getIPFSUrl(ipfsHash));
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleSubmit = async () => {
    if (!verificationStatus) {
      alert('Please select a verification status');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitVerification({
        documentHash: document.hash,
        studentAddress,
        status: verificationStatus,
        comments,
        documentType: document.type, // 'certificate' or 'gradeSheet'
      });
      
      // Reset form
      setVerificationStatus('');
      setComments('');
      onClose();
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh', borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Document Viewer
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              {document?.certificateName || document?.fileName || document?.semester || 'Document'}
            </Typography>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 'auto' }}>
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'row', height: '100%' }}>
        {/* PDF Viewer - Left Side */}
        <Box sx={{ flex: 1, bgcolor: '#F3F4F6', position: 'relative', minWidth: '50%' }}>
          {loadingPdf ? (
            <Box 
              display="flex" 
              flexDirection="column"
              alignItems="center" 
              justifyContent="center" 
              height="100%"
            >
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading document...</Typography>
            </Box>
          ) : (
            <iframe
              src={pdfUrl}
              title="Document Viewer"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          )}
        </Box>

        {/* Verification Form - Right Side */}
        <Box sx={{ 
          width: '400px', 
          p: 3, 
          borderLeft: '2px solid #E5E7EB', 
          bgcolor: 'white',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Document Verification
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
              Verification Status *
            </FormLabel>
            <RadioGroup
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
            >
              <FormControlLabel
                value="verified"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <VerifiedIcon sx={{ color: '#10B981', fontSize: 20, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Verified
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                        Document is authentic and meets all requirements
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{
                  border: '2px solid',
                  borderColor: verificationStatus === 'verified' ? '#10B981' : '#E5E7EB',
                  borderRadius: 2,
                  p: 1.5,
                  mb: 1.5,
                  ml: 0,
                  mr: 0,
                  bgcolor: verificationStatus === 'verified' ? '#ECFDF5' : 'white',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#10B981',
                    bgcolor: '#F0FDF4',
                  },
                }}
              />
              <FormControlLabel
                value="needMoreDocuments"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <WarningIcon sx={{ color: '#F59E0B', fontSize: 20, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Need More Documents
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                        Additional documentation required
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{
                  border: '2px solid',
                  borderColor: verificationStatus === 'needMoreDocuments' ? '#F59E0B' : '#E5E7EB',
                  borderRadius: 2,
                  p: 1.5,
                  ml: 0,
                  mr: 0,
                  bgcolor: verificationStatus === 'needMoreDocuments' ? '#FFFBEB' : 'white',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#F59E0B',
                    bgcolor: '#FFFBEB',
                  },
                }}
              />
            </RadioGroup>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments (Optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any notes or feedback about this document..."
            sx={{ mb: 2 }}
          />

          {verificationStatus === 'needMoreDocuments' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              The student will be notified that additional documents are required.
            </Alert>
          )}

          {verificationStatus === 'verified' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Document will be marked as verified.
            </Alert>
          )}

          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={!verificationStatus || submitting}
              sx={{
                bgcolor: verificationStatus === 'verified' ? '#10B981' : '#F59E0B',
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: verificationStatus === 'verified' ? '#059669' : '#D97706',
                },
                '&:disabled': {
                  bgcolor: '#D1D5DB',
                },
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </Box>
        </Box>
      </DialogContent>


    </Dialog>
  );
};

export default DocumentViewerModal;
