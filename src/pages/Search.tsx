import React, { useState } from 'react';
import axios from 'axios';
import { usePlayer, Track as PlayerTrack } from '../contexts/PlayerContext';
import { usePlaylist } from '../contexts/PlaylistContext';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { PlayArrow, Favorite, FavoriteBorder, MoreVert } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { PlaylistMenu } from '../components/PlaylistMenu';

// Define SearchTrack interface for search results
interface SearchTrack extends Omit<PlayerTrack, 'streamUrl'> {
  streamUrl?: string;
  downloadUrl?: string;
  perma_url?: string;
}

// Helper function to convert SearchTrack to PlayerTrack
const toPlayerTrack = (track: SearchTrack, streamUrl: string): PlayerTrack => ({
  ...track,
  streamUrl
});

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: 22,
  background: 'rgba(255,255,255,0.11)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
  backdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.15)',
  transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.025)',
    boxShadow: '0 16px 48px 0 rgba(29,185,84,0.12)',
    '& .playButton': {
      opacity: 1,
      transform: 'scale(1.08)',
    }
  },
}));

const PlayButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 8,
  right: 8,
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  opacity: 0,
  transform: 'scale(0.8)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1) !important',
  },
}));

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrack, setSelectedTrack] = useState<SearchTrack | null>(null);
  const { playTrack, currentTrack } = usePlayer();
  const { isLiked, toggleLiked } = usePlaylist();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/search/songs?query=${encodeURIComponent(searchTerm)}`);
      setSearchResults(response.data.data.results);
    } catch (error) {
      console.error('Error searching songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackClick = async (track: SearchTrack) => {
    // If this track is already playing, don't fetch again
    if (currentTrack?.id === track.id) {
      return;
    }

    // Show loading state
    const button = document.querySelector(`[data-track-id="${track.id}"]`);
    if (button) {
      button.classList.add('animate-pulse');
    }

    try {
      // First try to use the existing download URL
      if (track.downloadUrl) {
        console.log('Using existing download URL for playback:', track.downloadUrl);
        playTrack(toPlayerTrack(track, track.downloadUrl));
        return;
      }

      // If no download URL, try using existing stream URL
      if (track.streamUrl) {
        console.log('Using existing stream URL:', track.streamUrl);
        playTrack(toPlayerTrack(track, track.streamUrl));
        return;
      }

      console.log('Getting stream URL for track:', track.id);
      
      // Get the stream URL from API
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/songs/${track.id}`);
      console.log('API Response:', response.data);

      if (!response.data?.data) {
        throw new Error('Invalid API response - no data');
      }

      const songData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
      console.log('Song data:', songData);

      // Try to get download URL from response
      let streamUrl = '';
      
      if (Array.isArray(songData.downloadUrl)) {
        // Find the highest quality version (320kbps preferred)
        const qualities = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
        for (const quality of qualities) {
          const urlObj = songData.downloadUrl.find((d: any) => d.quality === quality);
          if (urlObj?.url) {
            streamUrl = urlObj.url;
            console.log(`Found ${quality} URL:`, streamUrl);
            break;
          }
        }
      } else if (typeof songData.downloadUrl === 'string') {
        streamUrl = songData.downloadUrl;
        console.log('Using direct download URL:', streamUrl);
      }

      if (!streamUrl) {
        throw new Error('No valid stream URL found');
      }

      // Play the track with the found stream URL
      const updatedTrack = {
        ...track,
        downloadUrl: streamUrl // Save the URL for future use
      };
      playTrack(toPlayerTrack(updatedTrack, streamUrl));
    } catch (error: any) {
      console.error('Error playing track:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Show error to user with more details
      alert(`Failed to play track: ${error.response?.data?.error || error.message}. Please try again.`);
    } finally {
      // Remove loading state
      const button = document.querySelector(`[data-track-id="${track.id}"]`);
      if (button) {
        button.classList.remove('animate-pulse');
      }
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, track: SearchTrack) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTrack(track);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTrack(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <form onSubmit={handleSearch}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
          }}
        />
      </form>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : searchResults.length > 0 ? (
        <Grid container spacing={3}>
          {searchResults.map((track) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
              <StyledCard>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={track.thumbnail || 'https://via.placeholder.com/300'}
                    alt={track.title}
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease-in-out',
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  <PlayButton
                    className="playButton"
                    data-track-id={track.id}
                    onClick={() => handleTrackClick(track)}
                  >
                    <PlayArrow />
                  </PlayButton>
                </Box>
                <CardContent>
                  <Typography variant="h6" noWrap>{track.title}</Typography>
                  <Typography variant="subtitle1" color="text.secondary" noWrap>
                    {track.artist}
                  </Typography>
                  {track.album && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {track.album}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {track.duration || ''}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleLiked(track as PlayerTrack)}
                        sx={{
                          color: isLiked(track.id) ? 'primary.main' : 'inherit'
                        }}
                      >
                        {isLiked(track.id) ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={(e) => handleMenuClick(e, track)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      ) : searchTerm && !isLoading ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No results found for "{searchTerm}"
        </Typography>
      ) : null}

      {selectedTrack && (
        <PlaylistMenu
          anchorEl={menuAnchorEl}
          onClose={handleMenuClose}
          track={selectedTrack as PlayerTrack}
        />
      )}
    </Box>
  );
};

export default Search;