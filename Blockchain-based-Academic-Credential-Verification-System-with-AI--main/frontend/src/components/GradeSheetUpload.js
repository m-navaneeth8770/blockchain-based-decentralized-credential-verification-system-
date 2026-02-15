import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const GradeSheetUpload = ({ open, onClose, studentAddress, studentName, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // IPFS upload functions
  const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://localhost:5001/api/v0/add', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.Hash;
  };

  const uploadJSONToIPFS = async (jsonData) => {
    const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });
    return await uploadToIPFS(file);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type (PDF, images, etc.)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF or image file');
        return;
      }
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !semester || !academicYear) {
      toast.error('Please fill all fields and select a file');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(20);
      console.log('📚 Starting grade sheet upload to IPFS...', file.name);

      // Upload file to IPFS
      const fileCID = await uploadToIPFS(file);
      setUploadProgress(50);
      console.log('✅ File uploaded to IPFS, CID:', fileCID);

      // Create metadata
      const gradeSheetData = {
        fileCID,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        studentAddress,
        studentName,
        semester,
        academicYear,
      };

      // Upload metadata to IPFS
      const metadataCID = await uploadJSONToIPFS(gradeSheetData);
      setUploadProgress(80);
      console.log('✅ Metadata uploaded to IPFS, CID:', metadataCID);

      // Call the callback with IPFS hash
      await onUploadSuccess(studentAddress, metadataCID, semester, academicYear);
      setUploadProgress(100);

      toast.success('Grade sheet uploaded to IPFS successfully!');
      handleClose();
    } catch (error) {
      console.error('❌ Error uploading grade sheet:', error);
      toast.error('Failed to upload grade sheet: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setFile(null);
    setSemester('');
    setAcademicYear('');
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Upload Grade Sheet
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={uploading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Upload grade sheet for <strong>{studentName}</strong>
          </Alert>

          <TextField
            fullWidth
            label="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="e.g., Semester 1, Fall 2024"
            disabled={uploading}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Academic Year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g., 2023-2024"
            disabled={uploading}
            sx={{ mb: 3 }}
          />

          <Box
            sx={{
              border: '2px dashed #E5E7EB',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: '#F9FAFB',
              cursor: uploading ? 'not-allowed' : 'pointer',
              '&:hover': {
                borderColor: uploading ? '#E5E7EB' : '#4F46E5',
                bgcolor: uploading ? '#F9FAFB' : '#EEF2FF',
              },
            }}
            onClick={() => !uploading && document.getElementById('grade-sheet-file').click()}
          >
            <input
              id="grade-sheet-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <UploadIcon sx={{ fontSize: 48, color: '#9CA3AF', mb: 1 }} />
            <Typography variant="body1" sx={{ color: '#374151', mb: 0.5 }}>
              {file ? file.name : 'Click to upload grade sheet'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              PDF, JPG, PNG (Max 10MB)
            </Typography>
          </Box>

          {uploading && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                Uploading to IPFS... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={uploading} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || !semester || !academicYear || uploading}
          sx={{
            bgcolor: '#4F46E5',
            textTransform: 'none',
            '&:hover': { bgcolor: '#4338CA' },
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GradeSheetUpload;
