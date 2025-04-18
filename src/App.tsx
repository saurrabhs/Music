import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import Player from './components/Player';
import Header from './components/Header';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import SmartPlaylist from './pages/SmartPlaylist';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { PlayerProvider } from './contexts/PlayerContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1db954',
      light: '#1ed760',
      dark: '#1aa34a',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#181818',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '500px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with full layout */}
            <Route path="/*" element={
              <ProtectedRoute>
                <PlayerProvider>
                  <PlaylistProvider>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#121212', color: 'white' }}>
                      <Header />
                      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                        <Navbar />
                        <main style={{ flex: 1, overflowY: 'auto', marginLeft: '256px', paddingTop: '8px' }}>
                          <div style={{ maxWidth: '1536px', margin: '0 auto', padding: '0 24px', paddingBottom: '90px' }}>
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="search" element={<Search />} />
                              <Route path="library" element={<Library />} />
                              <Route path="smart-playlist" element={<SmartPlaylist />} />
                            </Routes>
                          </div>
                        </main>
                      </div>
                      <Player />
                    </div>
                  </PlaylistProvider>
                </PlayerProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;