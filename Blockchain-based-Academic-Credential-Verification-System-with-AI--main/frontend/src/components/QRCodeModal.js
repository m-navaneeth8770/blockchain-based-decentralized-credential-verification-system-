import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
import QRCode from 'qrcode';

const QRCodeModal = ({ open, onClose, data, title = 'QR Code' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (open && data && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        data,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [open, data]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = url;
      link.click();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 3,
          }}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: 'white',
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              mb: 2,
            }}
          >
            <canvas ref={canvasRef} />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
              textAlign: 'center',
              maxWidth: 400,
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            {data}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: 'none', color: '#6B7280' }}
        >
          Close
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{
            bgcolor: '#4F46E5',
            textTransform: 'none',
            '&:hover': { bgcolor: '#4338CA' },
          }}
        >
          Download QR Code
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeModal;
