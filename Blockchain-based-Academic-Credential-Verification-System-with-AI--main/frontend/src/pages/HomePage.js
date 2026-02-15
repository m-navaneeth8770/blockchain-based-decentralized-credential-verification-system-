import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import {
  School as SchoolIcon,
  VerifiedUser as VerifiedIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Public as PublicIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const HomePage = () => {
  const { connectWallet, isConnected, account } = useBlockchain();
  const navigate = useNavigate();

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40, color: '#4F46E5' }} />,
      title: 'Digital Certificate',
      description: 'Blockchain Secured',
      bgColor: '#EEF2FF',
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 40, color: '#10B981' }} />,
      title: 'Verified Badge',
      description: 'Tamper Proof',
      bgColor: '#ECFDF5',
    },
    {
      icon: <PersonIcon sx={{ fontSize: 40, color: '#8B5CF6' }} />,
      title: 'Student Portal',
      description: 'Easy Access',
      bgColor: '#F5F3FF',
    },
    {
      icon: <PublicIcon sx={{ fontSize: 40, color: '#F59E0B' }} />,
      title: 'Global Verify',
      description: 'Instant Check',
      bgColor: '#FEF3C7',
    },
  ];

  const benefits = [
    'Tamper-proof credential storage on blockchain',
    'Instant verification without contacting universities',
    'Student-controlled certificate sharing',
    'Compliant with NAD & ABC standards',
    'Trusted by 500+ institutions & corporations',
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF', width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <Toolbar sx={{ py: 1 }}>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
              }}
            >
              <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700 }}>
              BlockVerify
            </Typography>
          </Box>
          <Button
            variant="text"
            sx={{ color: '#6B7280', mr: 2, textTransform: 'none', fontWeight: 500 }}
          >
            Home
          </Button>
          {isConnected ? (
            <Button
              variant="outlined"
              sx={{
                borderColor: '#E5E7EB',
                color: '#374151',
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
              }}
            >
              {`${account?.slice(0, 6)}...${account?.slice(-4)}`}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={connectWallet}
              sx={{
                bgcolor: '#4F46E5',
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'inline-block',
                px: 2,
                py: 0.5,
                bgcolor: '#EEF2FF',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#4F46E5', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Blockchain Powered
              </Typography>
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: '#111827',
                mb: 2,
                lineHeight: 1.2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Empowering the Future of Learning and Hiring with{' '}
              <Box component="span" sx={{ color: '#4F46E5' }}>
                Verifiable Digital Credentials
              </Box>
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: '#6B7280', mb: 4, fontWeight: 400, lineHeight: 1.6 }}
            >
              Transform your institution with our secure, tamper-proof, and digitally verified
              credential issuance platform, compliant with NAD & ABC standards as per NEP-2020.
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                size="large"
                onClick={connectWallet}
                sx={{
                  bgcolor: '#4F46E5',
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#4338CA' },
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': { borderColor: '#D1D5DB' },
                }}
              >
                Learn More
              </Button>
            </Box>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 3 }}>
              Trusted by 500+ Institutions & Corporations
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid item xs={6} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 3,
                      p: 2,
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: feature.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: '#F9FAFB', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 800, color: '#111827', mb: 2 }}
          >
            Why Choose BlockVerify?
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ color: '#6B7280', mb: 6, fontWeight: 400 }}
          >
            Secure, Fast, and Globally Recognized
          </Typography>
          <Grid container spacing={3}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#ECFDF5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckIcon sx={{ color: '#10B981', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500, pt: 0.5 }}>
                    {benefit}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 6,
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 2 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, fontWeight: 400 }}>
            Connect your wallet and experience the future of credential verification
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={connectWallet}
            sx={{
              bgcolor: 'white',
              color: '#4F46E5',
              textTransform: 'none',
              borderRadius: 2,
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 700,
              '&:hover': { bgcolor: '#F9FAFB' },
            }}
          >
            Connect Wallet Now
          </Button>
        </Card>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#111827', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center" sx={{ color: '#9CA3AF' }}>
            © 2024 BlockVerify. All rights reserved. | Powered by Blockchain Technology
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
