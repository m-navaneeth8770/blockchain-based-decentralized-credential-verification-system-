import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  QrCode as QrCodeIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

const ProfessionalCertificateUpload = ({ open, onClose, studentName, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Upload Certificate', 'Verify', 'Confirm', 'Pending Approval'];

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleVerify = async () => {
    if (!file) {
      setError('Please select a certificate file');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('certificate', file);
      formData.append('studentName', studentName);

      const response = await fetch('http://localhost:3002/api/verify-certificate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationResult(result);
        setActiveStep(1);
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify certificate. Please ensure the verification service is running.');
    } finally {
      setVerifying(false);
    }
  };

  const handleUploadToBlockchain = async () => {
    const trustLevel = verificationResult.finalDecision.trustLevel;
    const status = verificationResult.finalDecision.status;
    
    // Auto-reject LOW trust or REJECTED status
    if (trustLevel === 'LOW' || trustLevel === 'NONE' || status === 'REJECTED') {
      setError('Certificate verification failed. This certificate cannot be uploaded. Please ensure the certificate is authentic and matches your name.');
      return;
    }
    
    setUploading(true);
    try {
      // HIGHEST/HIGH trust → Auto-approve and upload to blockchain
      if (trustLevel === 'HIGHEST' || trustLevel === 'HIGH') {
        await onSuccess({
          file,
          verificationResult,
          status: 'APPROVED',
          autoApproved: true,
          trustLevel: trustLevel
        });
        setActiveStep(2);
      }
      // MEDIUM trust → Send for university approval
      else if (trustLevel === 'MEDIUM') {
        await onSuccess({
          file,
          verificationResult,
          status: 'PENDING',
          requiresApproval: true,
          trustLevel: trustLevel
        });
        setActiveStep(3); // New step for pending approval
      }
    } catch (err) {
      setError('Failed to process certificate: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getTrustLevelColor = (level) => {
    switch (level) {
      case 'HIGHEST': return '#10B981';
      case 'HIGH': return '#3B82F6';
      case 'MEDIUM': return '#F59E0B';
      case 'LOW': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'REJECTED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Upload Professional Certificate
          </Typography>
          <Button onClick={onClose} sx={{ minWidth: 'auto' }}>
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
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

        {/* Step 0: Upload */}
        {activeStep === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Upload your professional certificate. Our AI will automatically verify it using QR codes, OCR, and URL verification.
            </Alert>

            <Paper
              sx={{
                border: '2px dashed #D1D5DB',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: '#4F46E5', bgcolor: '#F9FAFB' },
              }}
              onClick={() => document.getElementById('cert-upload').click()}
            >
              <input
                id="cert-upload"
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <UploadIcon sx={{ fontSize: 64, color: '#9CA3AF', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {file ? file.name : 'Click to upload certificate'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Supports: JPG, PNG, PDF (Max 10MB)
              </Typography>
            </Paper>

            {preview && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <img
                  src={preview}
                  alt="Certificate preview"
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                />
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleVerify}
              disabled={!file || verifying}
              startIcon={verifying ? <CircularProgress size={20} /> : <VerifiedIcon />}
              sx={{
                mt: 3,
                bgcolor: '#4F46E5',
                py: 1.5,
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              {verifying ? 'Verifying Certificate...' : 'Verify Certificate'}
            </Button>
          </Box>
        )}

        {/* Step 1: Verification Results */}
        {activeStep === 1 && verificationResult && (
          <Box>
            <Paper
              sx={{
                p: 3,
                mb: 3,
                bgcolor: getStatusColor(verificationResult.finalDecision.status) + '15',
                border: `2px solid ${getStatusColor(verificationResult.finalDecision.status)}`,
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {verificationResult.finalDecision.status === 'APPROVED' && (
                  <CheckIcon sx={{ fontSize: 48, color: '#10B981' }} />
                )}
                {verificationResult.finalDecision.status === 'PENDING' && (
                  <WarningIcon sx={{ fontSize: 48, color: '#F59E0B' }} />
                )}
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {verificationResult.finalDecision.status === 'APPROVED' && 'Certificate Verified!'}
                    {verificationResult.finalDecision.status === 'PENDING' && 'Manual Review Required'}
                    {verificationResult.finalDecision.status === 'REJECTED' && 'Verification Failed'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Trust Level: {verificationResult.finalDecision.trustLevel} • 
                    Confidence: {verificationResult.finalDecision.confidence}%
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Verification Steps
            </Typography>

            <List>
              {verificationResult.steps.map((step, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {step.status === 'success' && <CheckIcon sx={{ color: '#10B981' }} />}
                    {step.status === 'failed' && <CloseIcon sx={{ color: '#EF4444' }} />}
                    {step.status === 'not_found' && <WarningIcon sx={{ color: '#F59E0B' }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={step.name}
                    secondary={step.status.replace('_', ' ')}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Verification Details:
              </Typography>

              {verificationResult.qrCode?.found && (
                <Chip
                  icon={<QrCodeIcon />}
                  label="QR Code Detected"
                  sx={{ mr: 1, mb: 1, bgcolor: '#ECFDF5', color: '#065F46' }}
                />
              )}

              {verificationResult.extractedURLs?.length > 0 && (
                <Chip
                  icon={<LinkIcon />}
                  label={`${verificationResult.extractedURLs.length} URL(s) Found`}
                  sx={{ mr: 1, mb: 1, bgcolor: '#EEF2FF', color: '#4F46E5' }}
                />
              )}

              {verificationResult.nameMatch?.match && (
                <Chip
                  icon={<PersonIcon />}
                  label={`Name Match: ${verificationResult.nameMatch.confidence}%`}
                  sx={{ mr: 1, mb: 1, bgcolor: '#FEF3C7', color: '#92400E' }}
                />
              )}
            </Box>

            {/* Action buttons based on trust level */}
            <Box display="flex" gap={2} mt={3}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                sx={{ flex: 1 }}
              >
                Upload Different Certificate
              </Button>
              
              {/* Show appropriate button based on verification result */}
              {(verificationResult.finalDecision.trustLevel === 'LOW' || 
                verificationResult.finalDecision.trustLevel === 'NONE' ||
                verificationResult.finalDecision.status === 'REJECTED') ? (
                <Button
                  variant="contained"
                  disabled
                  sx={{
                    flex: 1,
                    bgcolor: '#EF4444',
                    '&:disabled': { bgcolor: '#FCA5A5', color: '#fff' }
                  }}
                >
                  Cannot Upload - Verification Failed
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleUploadToBlockchain}
                  disabled={uploading}
                  sx={{
                    flex: 1,
                    bgcolor: verificationResult.finalDecision.trustLevel === 'MEDIUM' ? '#F59E0B' : '#4F46E5',
                    '&:hover': { 
                      bgcolor: verificationResult.finalDecision.trustLevel === 'MEDIUM' ? '#D97706' : '#4338CA' 
                    },
                  }}
                >
                  {uploading ? 'Processing...' : 
                   verificationResult.finalDecision.trustLevel === 'MEDIUM' ? 
                   'Submit for University Approval' : 
                   'Upload to Blockchain'}
                </Button>
              )}
            </Box>
            
            {/* Show explanation based on trust level */}
            <Alert 
              severity={
                verificationResult.finalDecision.trustLevel === 'HIGHEST' || 
                verificationResult.finalDecision.trustLevel === 'HIGH' ? 'success' :
                verificationResult.finalDecision.trustLevel === 'MEDIUM' ? 'warning' : 'error'
              } 
              sx={{ mt: 2 }}
            >
              {verificationResult.finalDecision.trustLevel === 'HIGHEST' && 
                '✅ High confidence verification! Your certificate will be automatically approved and added to your profile.'}
              {verificationResult.finalDecision.trustLevel === 'HIGH' && 
                '✅ Good verification! Your certificate will be automatically approved and added to your profile.'}
              {verificationResult.finalDecision.trustLevel === 'MEDIUM' && 
                '⚠️ Medium confidence. Your certificate will be sent to your university for manual approval before being added to your profile.'}
              {(verificationResult.finalDecision.trustLevel === 'LOW' || 
                verificationResult.finalDecision.trustLevel === 'NONE') && 
                '❌ Verification failed. This certificate cannot be uploaded. Please check that the certificate is authentic and matches your registered name.'}
            </Alert>
          </Box>
        )}

        {/* Step 2: Success (Auto-approved) */}
        {activeStep === 2 && (
          <Box textAlign="center" py={4}>
            <CheckIcon sx={{ fontSize: 80, color: '#10B981', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Certificate Uploaded Successfully!
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Your professional certificate has been automatically verified and added to the blockchain.
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                bgcolor: '#4F46E5',
                px: 4,
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              Done
            </Button>
          </Box>
        )}

        {/* Step 3: Pending University Approval */}
        {activeStep === 3 && (
          <Box textAlign="center" py={4}>
            <WarningIcon sx={{ fontSize: 80, color: '#F59E0B', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Pending University Approval
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Your certificate has been submitted for manual review by your university. 
              You will be notified once it's approved and added to the blockchain.
            </Typography>
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>What happens next?</strong><br/>
                • Your university will review the certificate<br/>
                • If approved, it will be automatically added to your profile<br/>
                • You'll receive a notification when the review is complete
              </Typography>
            </Alert>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                bgcolor: '#4F46E5',
                px: 4,
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              Done
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfessionalCertificateUpload;
