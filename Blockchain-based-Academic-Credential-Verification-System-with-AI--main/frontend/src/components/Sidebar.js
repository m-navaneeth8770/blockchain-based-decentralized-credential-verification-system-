import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  VerifiedUser as VerifyIcon,
  ListAlt as ListIcon,
  AccountBalance as UniversityIcon,
  Link as BlockchainIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Issue Credential', icon: <SchoolIcon />, path: '/issue' },
  { text: 'Verify Credential', icon: <VerifyIcon />, path: '/verify' },
  { text: 'Credential List', icon: <ListIcon />, path: '/credentials' },
  { text: 'University Management', icon: <UniversityIcon />, path: '/universities' },
  { text: 'Blockchain Info', icon: <BlockchainIcon />, path: '/blockchain' },
];

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, account } = useBlockchain();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <SchoolIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          ACV System
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Academic Credential Verification
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActivePath(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActivePath(item.path) ? 'white' : 'primary.main',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActivePath(item.path) ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Wallet Status */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Wallet Status
        </Typography>
        {isConnected ? (
          <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
            <Typography variant="body2" color="success.dark" sx={{ fontWeight: 600 }}>
              ✓ Connected
            </Typography>
            <Typography variant="caption" color="success.dark" sx={{ wordBreak: 'break-all' }}>
              {account}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
            <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 600 }}>
              ⚠ Not Connected
            </Typography>
            <Typography variant="caption" color="warning.dark">
              Connect your wallet to use the system
            </Typography>
          </Box>
        )}
      </Box>

      {/* Quick Actions */}
      {isConnected && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation('/issue')}
                sx={{
                  borderRadius: 1,
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <SchoolIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Issue New Credential"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItemButton>
              <ListItemButton
                onClick={() => handleNavigation('/verify')}
                sx={{
                  borderRadius: 1,
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <VerifyIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Verify Credential"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItemButton>
            </Box>
          </Box>
        </>
      )}

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Powered by Ethereum Blockchain
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.2)',
              zIndex: 1300,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'fixed',
              height: '100vh',
              zIndex: 1200,
              transition: 'transform 0.3s ease-in-out',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
