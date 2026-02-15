import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  AccountBalanceWallet as WalletIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useBlockchain } from '../context/BlockchainContext';

const Header = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { account, isConnected, connectWallet, disconnectWallet, isLoading } = useBlockchain();

  const handleWalletAction = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 1337:
        return 'Local Network';
      default:
        return 'Unknown Network';
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: theme.zIndex.drawer + 1,
      }}
      elevation={0}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Mobile Menu Button */}
        <IconButton
          color="primary"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <SchoolIcon
            sx={{
              color: 'primary.main',
              fontSize: { xs: 28, sm: 32 },
              mr: 1,
            }}
          />
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Academic Credential Verification
          </Typography>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'block', sm: 'none' },
            }}
          >
            ACV System
          </Typography>
        </Box>

        {/* Wallet Connection */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isConnected ? (
            <>
              {/* Network Info */}
              <Chip
                label="Connected"
                color="success"
                size="small"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
              
              {/* Account Info */}
              <Chip
                icon={<Avatar sx={{ width: 16, height: 16, fontSize: '0.75rem' }}>
                  {account?.slice(2, 4).toUpperCase()}
                </Avatar>}
                label={`${account?.slice(0, 6)}...${account?.slice(-4)}`}
                variant="outlined"
                color="primary"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
              
              {/* Disconnect Button */}
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleWalletAction}
                disabled={isLoading}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Disconnect
              </Button>
              
              {/* Mobile Disconnect */}
              <IconButton
                color="secondary"
                onClick={handleWalletAction}
                disabled={isLoading}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<WalletIcon />}
              onClick={handleWalletAction}
              disabled={isLoading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
