import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { BlockchainProvider, useBlockchain } from './context/BlockchainContext';

// Pages
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import UniversityDashboard from './pages/UniversityDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VerifierDashboard from './pages/VerifierDashboard';

// Landing Page Component - Redirect to HomePage
const LandingPage = () => {
  const { isConnected, userRole } = useBlockchain();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LandingPage - isConnected:', isConnected, 'userRole:', userRole);
    if (isConnected && userRole) {
      // Auto-redirect based on role
      console.log('Redirecting to dashboard for role:', userRole);
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'university':
          navigate('/university');
          break;
        case 'student':
          navigate('/student');
          break;
        case 'verifier':
          navigate('/verifier');
          break;
        default:
          break;
      }
    }
  }, [isConnected, userRole, navigate]);

  return <HomePage />;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { userRole, isConnected, isLoading } = useBlockchain();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== allowedRole) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Unauthorized Access
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You don't have permission to access this page.
          </Typography>
          <Button variant="contained" href="/">
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
};

// Main App Component
function AppContent() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <CssBaseline />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/university"
          element={
            <ProtectedRoute allowedRole="university">
              <UniversityDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/verifier"
          element={
            <ProtectedRoute allowedRole="verifier">
              <VerifierDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Box>
  );
}

function App() {
  return (
    <BlockchainProvider>
      <AppContent />
    </BlockchainProvider>
  );
}

export default App;
