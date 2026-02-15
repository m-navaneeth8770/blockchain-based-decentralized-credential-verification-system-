import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as VerifiedIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { verifyCertificate, detectPlatform, getPlatformDisplayName } from '../services/certificateVerification';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../utils/ipfs';

const CertificateUploadModal = ({ open, onClose, onUpload, studentName }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    certificateName: '',
    organization: '',
    certificateUrl: '',
    issueDate: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const steps = ['Certificate Details', 'Upload File', 'Verification'];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyCertificate({
        url: formData.certificateUrl,
        studentName: studentName,
        certificateName: formData.certificateName,
      });

      setVerificationResult(result);
      setActiveStep(2);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        verified: false,
        message: 'Verification failed. Certificate will require manual review.',
        requiresManualReview: true,
      });
      setActiveStep(2);
    } finally {
      setVerifying(false);
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);

      let fileCID = null;
      let metadataCID = null;

      // Upload file to IPFS if provided
      if (file) {
        try {
          fileCID = await uploadFileToIPFS(file);
          console.log('File uploaded to IPFS:', fileCID);
        } catch (error) {
          console.error('IPFS upload error:', error);
          // Continue without IPFS if it fails
        }
      }

      // Create metadata
      const metadata = {
        certificateName: formData.certificateName,
        organization: formData.organization,
        certificateUrl: formData.certificateUrl,
        issueDate: formData.issueDate,
        description: formData.description,
        fileCID: fileCID,
        fileName: file?.name,
        fileType: file?.type,
        fileSize: file?.size,
        verificationResult: verificationResult,
        platform: verificationResult?.platform,
        autoVerified: verificationResult?.verified || false,
        uploadedAt: new Date().toISOString(),
      };

      // Upload metadata to IPFS
      try {
        metadataCID = await uploadJSONToIPFS(metadata);
        console.log('Metadata uploaded to IPFS:', metadataCID);
      } catch (error) {
        console.error('Metadata upload error:', error);
      }

      // Call parent upload function
      await onUpload({
        certificateHash: metadataCID || `cert_${Date.now()}`,
        certificateName: formData.certificateName,
        metadata: JSON.stringify(metadata),
        autoVerified: verificationResult?.verified || false,
      });

      // Reset and close
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload certificate. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      certificateName: '',
      organization: '',
      certificateUrl: '',
      issueDate: '',
      description: '',
    });
    setFile(null);
    setVerificationResult(null);
    onClose();
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.certificateName || !formData.organization)) {
      alert('Please fill in required fields');
      return;
    }
    if (activeStep === 1 && formData.certificateUrl) {
      handleVerify();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const platform = formData.certificateUrl ? detectPlatform(formData.certificateUrl) : null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Upload Professional Certificate
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Certificate Details */}
        {activeStep === 0 && (
          <Box>
            <TextField
              fullWidth
              label="Certificate Name"
              name="certificateName"
              value={formData.certificateName}
              onChange={handleInputChange}
              required
              margin="normal"
              placeholder="e.g., Python Programming Certificate"
            />
            <TextField
              fullWidth
              label="Issuing Organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              required
              margin="normal"
              placeholder="e.g., HackerRank, Coursera, Google"
            />
            <TextField
              fullWidth
              label="Certificate URL (for verification)"
              name="certificateUrl"
              value={formData.certificateUrl}
              onChange={handleInputChange}
              margin="normal"
              placeholder="https://www.hackerrank.com/certificates/abc123"
              helperText="Provide the public verification URL if available"
            />
            {platform && (
              <Box mt={2}>
                <Chip
                  label={`Detected: ${getPlatformDisplayName(platform)}`}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
            <TextField
              fullWidth
              label="Issue Date"
              name="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Additional details about the certificate"
            />
          </Box>
        )}

        {/* Step 2: Upload File */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Upload your certificate file (Image or PDF)
            </Typography>
            <Box
              sx={{
                border: '2px dashed #E5E7EB',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: '#F9FAFB',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#4F46E5',
                  bgcolor: '#EEF2FF',
                },
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <UploadIcon sx={{ fontSize: 48, color: '#9CA3AF', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#6B7280', mb: 1 }}>
                {file ? file.name : 'Click to upload certificate'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Supported formats: JPG, PNG, PDF (Max 5MB)
              </Typography>
            </Box>
            {file && (
              <Alert severity="success" sx={{ mt: 2 }}>
                File selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Alert>
            )}
          </Box>
        )}

        {/* Step 3: Verification Result */}
        {activeStep === 2 && (
          <Box>
            {verifying ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2, color: '#6B7280' }}>
                  Verifying certificate...
                </Typography>
              </Box>
            ) : verificationResult ? (
              <Box>
                {verificationResult.verified ? (
                  <Alert
                    severity="success"
                    icon={<VerifiedIcon />}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Certificate Auto-Verified! ✅
                    </Typography>
                    <Typography variant="body2">
                      {verificationResult.message}
                    </Typography>
                  </Alert>
                ) : (
                  <Alert
                    severity="warning"
                    icon={<PendingIcon />}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Manual Verification Required
                    </Typography>
                    <Typography variant="body2">
                      {verificationResult.message}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Your certificate will be reviewed by your university.
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2, p: 2, mt: 2 }}>
                  <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
                    Certificate Details:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {formData.certificateName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Organization:</strong> {formData.organization}
                  </Typography>
                  {verificationResult.platform && (
                    <Typography variant="body2">
                      <strong>Platform:</strong> {getPlatformDisplayName(verificationResult.platform)}
                    </Typography>
                  )}
                  {file && (
                    <Typography variant="body2">
                      <strong>File:</strong> {file.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : null}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        {activeStep > 0 && activeStep < 2 && (
          <Button onClick={handleBack} sx={{ textTransform: 'none' }}>
            Back
          </Button>
        )}
        {activeStep < 2 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={verifying}
            sx={{
              bgcolor: '#4F46E5',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4338CA' },
            }}
          >
            {activeStep === 1 && formData.certificateUrl ? 'Verify & Continue' : 'Next'}
          </Button>
        ) : (
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            sx={{
              bgcolor: '#4F46E5',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4338CA' },
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Certificate'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CertificateUploadModal;
