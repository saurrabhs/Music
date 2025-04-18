import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { usePlayer } from '../contexts/PlayerContext';
import { Track, usePlaylist } from '../contexts/PlaylistContext';
import LikeButton from '../components/LikeButton';
import axios from 'axios';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';

interface SearchResult {
  id: string;
  title: string;
  album: string;
  downloadUrl: string;
  duration: string;
  image: string;
  primaryArtists: string;
  language: string;
  year: string;
  perma_url: string;
}

interface SearchResponse {
  data: {
    results: SearchResult[];
  };
}

const SmartPlaylist: React.FC = () => {
  const [query, setQuery] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedSongs, setGeneratedSongs] = useState<Track[]>([]);
  const { addPlaylist } = usePlaylist();
  const { playTrack, currentTrack } = usePlayer();

  const handleGeneratePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !playlistName.trim()) {
      setError('Please enter both a query and playlist name');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Search for songs using the query
      console.log('Searching for songs with query:', query);
      const response = await axios.get<SearchResponse>(`${process.env.REACT_APP_API_URL}/search/songs`, {
        params: {
          query: query
        },
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Search Response:', response.data);

      if (!response.data?.data?.results || response.data.data.results.length === 0) {
        throw new Error('No songs found for your search');
      }

      // Take maximum 7 songs from the results
      const searchResults = response.data.data.results.slice(0, 7);
      console.log('Selected songs:', searchResults);

      // Step 2: Convert search results to Track format
      const tracks: Track[] = searchResults.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.primaryArtists,
        streamUrl: song.downloadUrl,
        thumbnail: song.image,
        duration: song.duration,
        album: song.album,
        year: song.year,
        language: song.language,
        perma_url: song.perma_url
      }));

      console.log('Converted to tracks:', tracks);

      // Step 3: Create a new playlist with these tracks
      addPlaylist(playlistName, tracks);
      console.log('Created playlist:', playlistName, 'with tracks:', tracks);

      // Update UI
      setGeneratedSongs(tracks);
      setSuccess(`Playlist "${playlistName}" created with ${tracks.length} songs! Check your library.`);

      // Reset form
      setQuery('');
      setPlaylistName('');
    } catch (err) {
      console.error('Error generating playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: Track) => {
    // Play the track with the entire playlist
    playTrack(track, generatedSongs);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Create Smart Playlist
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Enter a theme, mood, artist name, or genre to automatically generate a playlist of up to 7 songs.
        </Typography>

        <Box component="form" noValidate sx={{ mt: 3 }} onSubmit={handleGeneratePlaylist}>
          <TextField
            fullWidth
            label="Playlist Name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="e.g., Sad Songs, Happy Vibes, Rock Classics"
          />
          <TextField
            fullWidth
            label="Search Query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="e.g., tum hi ho, arijit singh, ed sheeran"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !query.trim() || !playlistName.trim()}
            sx={{ mt: 2, mb: 4 }}
            fullWidth
          >
            {loading ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Generating Playlist...
              </>
            ) : (
              'Generate Smart Playlist'
            )}
          </Button>
        </Box>

        {generatedSongs.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Generated Playlist: {playlistName}
            </Typography>
            <List>
              {generatedSongs.map((song) => (
                <ListItem 
                  key={song.id}
                  sx={{
                    bgcolor: currentTrack?.id === song.id ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={song.thumbnail} alt={song.title} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={song.title}
                    secondary={`${song.artist} • ${song.album}`}
                  />
                  <IconButton
                    onClick={() => handlePlayTrack(song)}
                    sx={{
                      color: currentTrack?.id === song.id ? 'primary.main' : 'inherit',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {currentTrack?.id === song.id ? <Pause /> : <PlayArrow />}
                  </IconButton>
                  <LikeButton 
                    track={song}
                    color="primary" 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SmartPlaylist;
