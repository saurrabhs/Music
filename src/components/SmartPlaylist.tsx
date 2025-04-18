import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { usePlaylist } from '../contexts/PlaylistContext';
import { Track } from '../contexts/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { playlistService } from '../services/playlistService';

interface SmartPlaylistProps {
  onPlaylistCreated?: () => void;
}

export const SmartPlaylist: React.FC<SmartPlaylistProps> = ({ onPlaylistCreated }) => {
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { addPlaylist } = usePlaylist();
  const navigate = useNavigate();

  const handleCreatePlaylist = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Search for songs using the query
      console.log('Searching for songs with query:', query);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/search/songs?query=${encodeURIComponent(query)}&limit=10`);
      
      if (!response.data?.data?.results?.length) {
        throw new Error('No songs found for the given query');
      }

      console.log('Found songs:', response.data.data.results.length);

      // Transform the songs into the correct format
      const tracks: Track[] = response.data.data.results.map((song: any) => {
        // Ensure all fields have non-undefined values
        const track = {
          id: song.id || '',
          title: song.name || '',
          artist: song.primaryArtists || 'Unknown Artist',
          streamUrl: song.downloadUrl?.[0]?.url || '',
          thumbnail: song.image?.[0]?.url || '',
          duration: song.duration?.toString() || '0',
          album: song.album?.name || '',
          year: song.year?.toString() || '',
          language: song.language || '',
          perma_url: song.url || ''
        };

        // Log the track for debugging
        console.log('Transformed track:', track);
        return track;
      });

      console.log('Creating playlist with tracks:', { title, trackCount: tracks.length });
      
      // Create playlist and add all tracks at once
      await addPlaylist(title, tracks);
      console.log('Successfully created playlist with tracks');

      // Clear form
      setTitle('');
      setQuery('');
      
      // Show success message
      setError(`Successfully created playlist with ${tracks.length} songs! Redirecting...`);
      
      // Navigate to library after a short delay
      setTimeout(() => {
        navigate('/library');
        // Notify parent
        onPlaylistCreated?.();
      }, 1500);
    } catch (error: any) {
      console.error('Error creating smart playlist:', error);
      setError(error.message || 'Failed to create playlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Create Smart Playlist
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Playlist Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          disabled={isLoading}
        />
        
        <TextField
          label="Song Query (e.g., 'sad songs', 'party music')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          required
          disabled={isLoading}
        />
        
        <Button
          variant="contained"
          onClick={handleCreatePlaylist}
          disabled={!title || !query || isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            'Generate Playlist'
          )}
        </Button>
      </Box>
    </Box>
  );
};
