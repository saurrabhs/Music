import React, { useState } from 'react';
import { usePlaylist, Track } from '../contexts/PlaylistContext';
import LikeButton from '../components/LikeButton';
import { usePlayer } from '../contexts/PlayerContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Pause,
  Delete,
  Favorite,
  QueueMusic,
} from '@mui/icons-material';

const Library: React.FC = () => {
  const { playlists, createPlaylist, deletePlaylist, likedSongs, loadPlaylists } = usePlaylist();
  const { playTrack, currentTrack } = usePlayer();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>('liked');
  const [isLoading, setIsLoading] = useState(true);

  // Load playlists when component mounts
  React.useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        await loadPlaylists();
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylists();
  }, [loadPlaylists]);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreateDialogOpen(false);
    }
  };

  const handlePlayTrack = (track: Track, playlistTracks: Track[]) => {
    // Play the track with its playlist for auto-play next functionality
    playTrack(track, playlistTracks);
  };

  const currentPlaylist = selectedPlaylist === 'liked'
    ? { id: 'liked', name: 'Liked Songs', tracks: likedSongs }
    : playlists.find(p => p.id === selectedPlaylist);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        p: { xs: 1, sm: 4 },
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px', textShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
          Your Library
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreateDialogOpen(true)}
          sx={{
            borderRadius: '999px',
            bgcolor: '#1DB954',
            color: '#181818',
            fontWeight: 700,
            fontSize: '1.08rem',
            boxShadow: '0 2px 8px rgba(29,185,84,0.16)',
            textTransform: 'none',
            px: 3,
            py: 1.2,
            letterSpacing: '0.05em',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: '#1ed760',
              boxShadow: '0 4px 18px rgba(29,185,84,0.25)',
              transform: 'translateY(-2px) scale(1.03)',
            },
          }}
        >
          Create Playlist
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Playlists</Typography>
              <List>
                <ListItem
                  button
                  selected={selectedPlaylist === 'liked'}
                  onClick={() => setSelectedPlaylist('liked')}
                >
                  <Favorite sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText 
                    primary="Liked Songs"
                    secondary={`${likedSongs.length} songs`}
                  />
                </ListItem>
                {playlists.filter(p => !p.isDefault).map(playlist => (
                  <ListItem
                    key={playlist.id}
                    button
                    selected={selectedPlaylist === playlist.id}
                    onClick={() => setSelectedPlaylist(playlist.id)}
                  >
                    <QueueMusic sx={{ mr: 2 }} />
                    <ListItemText
                      primary={playlist.name}
                      secondary={`${playlist.tracks.length} songs`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => deletePlaylist(playlist.id)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {currentPlaylist && (
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {currentPlaylist.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {currentPlaylist.tracks.length} songs
                </Typography>
                <List>
                  {currentPlaylist.tracks.map(track => (
                    <ListItem 
                      key={track.id}
                      sx={{
                        bgcolor: currentTrack?.id === track.id ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={track.thumbnail} alt={track.title} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={track.title}
                        secondary={`${track.artist} • ${track.album || ''}`}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <LikeButton track={track} color="primary" />
                        <IconButton 
                          onClick={() => handlePlayTrack(track, currentPlaylist.tracks)}
                          sx={{
                            color: currentTrack?.id === track.id ? 'primary.main' : 'inherit',
                            '&:hover': {
                              color: 'primary.main'
                            }
                          }}
                        >
                          {currentTrack?.id === track.id ? <Pause /> : <PlayArrow />}
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist Name"
            fullWidth
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePlaylist} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Library;