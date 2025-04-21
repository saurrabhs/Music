import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to create an account');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(-45deg, #1db954, #232526, #121212, #1db954)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 12s ease infinite',
        fontFamily: 'Inter, Roboto, Arial, sans-serif',
        overflow: 'auto',
        '@keyframes gradientBG': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 6,
            boxShadow: '0 8px 40px 0 rgba(31, 38, 135, 0.22)',
            background: 'rgba(255,255,255,0.11)',
            backdropFilter: 'blur(22px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.15)',
            width: '100%',
            maxWidth: 420,
            mt: { xs: 4, sm: 10 },
            mb: { xs: 4, sm: 10 },
          }}
        >
          {/* Creative SVG Icon */}
          <Box sx={{ mb: 2 }}>
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="27" cy="27" r="27" fill="#1DB954" fillOpacity="0.18"/>
              <path d="M17 27C21 31 33 31 37 27" stroke="#1DB954" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="21" cy="22" r="2" fill="#1DB954"/>
              <circle cx="33" cy="22" r="2" fill="#1DB954"/>
            </svg>
          </Box>
          <Box
            component="img"
            src="/logo.png"
            alt="Music Platform Logo"
            sx={{ width: 56, height: 56, mb: 2, borderRadius: 2, boxShadow: '0 2px 12px rgba(29,185,84,0.15)' }}
          />
          <Typography
            component="h1"
            variant="h4"
            sx={{
              color: '#fff',
              fontWeight: 800,
              mb: 1,
              letterSpacing: '-0.5px',
              textShadow: '0 2px 8px rgba(0,0,0,0.10)'
            }}
            gutterBottom
          >
            Create your account
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: 'rgba(255,255,255,0.75)', mb: 3, fontWeight: 400, fontSize: '1.1rem' }}
          >
            Join the music world today
          </Typography>
          {error && (
            <Typography color="error" sx={{ mb: 2, fontWeight: 500 }}>
              {error}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: '100%', mt: 1, gap: 2, display: 'flex', flexDirection: 'column' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                },
                label: {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 400,
                },
                '& label.Mui-focused': {
                  color: '#1DB954',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                  '&:hover fieldset': { borderColor: '#1DB954' },
                  '&.Mui-focused fieldset': { borderColor: '#1DB954' },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                },
                label: {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 400,
                },
                '& label.Mui-focused': {
                  color: '#1DB954',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                  '&:hover fieldset': { borderColor: '#1DB954' },
                  '&.Mui-focused fieldset': { borderColor: '#1DB954' },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                },
                label: {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 400,
                },
                '& label.Mui-focused': {
                  color: '#1DB954',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                  '&:hover fieldset': { borderColor: '#1DB954' },
                  '&.Mui-focused fieldset': { borderColor: '#1DB954' },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: '999px',
                bgcolor: '#1DB954',
                color: '#181818',
                fontWeight: 700,
                fontSize: '1.1rem',
                boxShadow: '0 2px 8px rgba(29,185,84,0.16)',
                textTransform: 'none',
                padding: '14px',
                letterSpacing: '0.05em',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#1ed760',
                  boxShadow: '0 4px 18px rgba(29,185,84,0.25)',
                  transform: 'translateY(-2px) scale(1.03)',
                },
              }}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#1DB954', textDecoration: 'underline', fontWeight: 600 }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
