import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, ListItemButton, Button } from '@mui/material';
import { Home, Search, LibraryMusic, Logout } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const mainMenuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Search', icon: <Search />, path: '/search' },
    { text: 'Your Library', icon: <LibraryMusic />, path: '/library' },
  ];

  // Removed duplicate playlist menu items since they're shown in library

  const playlists = [
    'My Playlist #1',
    'Chill Vibes',
    'Workout Mix',
    'Party Songs',
    'Road Trip',
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'transparent',
        background: 'linear-gradient(-45deg, #1db954, #232526, #121212, #1db954)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 12s ease infinite',
        '@keyframes gradientBG': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'rgba(24,24,24,0.72)',
            color: '#fff',
            borderRight: '1px solid rgba(40,40,40,0.45)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backdropFilter: 'blur(16px) saturate(140%)',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.16)',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ pt: 2, pb: 2, px: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Music Platform
            </Typography>
          </Box>
          <List>
            {mainMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  color: location.pathname === item.path ? '#fff' : '#b3b3b3',
                  '&:hover': {
                    color: '#fff',
                  },
                  '&.Mui-selected': {
                    bgcolor: '#282828',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          </List>

          <Divider sx={{ bgcolor: '#282828' }} />
          <List sx={{ overflow: 'auto', flexGrow: 1 }}>
            {playlists.map((text) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  sx={{
                    color: '#b3b3b3',
                    '&:hover': {
                      color: '#fff',
                    },
                  }}
                >
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        {currentUser && (
          <Box sx={{ p: 2, borderTop: '1px solid #282828' }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#b3b3b3', fontSize: '0.8rem' }}>
              {currentUser.email}
            </Typography>
            <Button
              onClick={handleLogout}
              variant="outlined"
              fullWidth
              startIcon={<Logout />}
              sx={{
                color: '#b3b3b3',
                borderColor: '#b3b3b3',
                '&:hover': {
                  color: '#fff',
                  borderColor: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                },
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Drawer>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#121212',
          minHeight: '100vh',
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 