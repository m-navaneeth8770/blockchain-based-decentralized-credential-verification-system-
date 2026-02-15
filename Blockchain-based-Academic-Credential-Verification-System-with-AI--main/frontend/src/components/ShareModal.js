import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ShareModal = ({ open, onClose, data, title = 'Share' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Wallet Address');
    const body = encodeURIComponent(`Here is the wallet address:\n\n${data}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSMSShare = () => {
    const body = encodeURIComponent(`Wallet Address: ${data}`);
    window.open(`sms:?body=${body}`);
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
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
            Share this address with students for registration
          </Typography>
          
          <TextField
            fullWidth
            value={data}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopy} edge="end">
                    <CopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Share via:
          </Typography>

          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={handleEmailShare}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderColor: '#E5E7EB',
                color: '#374151',
                '&:hover': { borderColor: '#4F46E5', color: '#4F46E5' },
              }}
            >
              Share via Email
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MessageIcon />}
              onClick={handleSMSShare}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderColor: '#E5E7EB',
                color: '#374151',
                '&:hover': { borderColor: '#4F46E5', color: '#4F46E5' },
              }}
            >
              Share via SMS
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={handleCopy}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderColor: '#E5E7EB',
                color: '#374151',
                '&:hover': { borderColor: '#4F46E5', color: '#4F46E5' },
              }}
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#4F46E5',
            textTransform: 'none',
            '&:hover': { bgcolor: '#4338CA' },
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareModal;
