import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePlayer, Track as PlayerTrack } from '../contexts/PlayerContext';
import { usePlaylist } from '../contexts/PlaylistContext';
import { CircularProgress, Grid, Typography, Box, Card, CardContent, CardMedia, IconButton } from '@mui/material';
import { PlayArrow, Favorite, FavoriteBorder, MoreVert } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { PlaylistMenu } from '../components/PlaylistMenu';

// Define SearchTrack interface for search results
interface SearchTrack extends Omit<PlayerTrack, 'streamUrl'> {
  streamUrl?: string;
  downloadUrl?: string;
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
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    '& .playButton': {
      opacity: 1,
      transform: 'scale(1)',
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

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(4),
}));

const Home: React.FC = () => {
  const [newReleases, setNewReleases] = useState<SearchTrack[]>([]);
  const [madeForYou, setMadeForYou] = useState<SearchTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrack, setSelectedTrack] = useState<SearchTrack | null>(null);
  const { playTrack, currentTrack } = usePlayer();
  const { isLiked, toggleLiked } = usePlaylist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get some popular songs for new releases and recommendations
        const [newResponse, recommendedResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/search/songs?query=new`),
          axios.get(`${process.env.REACT_APP_API_URL}/search/songs?query=popular`),
        ]);

        setNewReleases(newResponse.data.data.results.slice(0, 6));
        setMadeForYou(recommendedResponse.data.data.results.slice(0, 6));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTrackClick = async (track: SearchTrack, playlist: SearchTrack[]) => {
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
        playTrack(toPlayerTrack(track, track.downloadUrl), playlist.map(t => toPlayerTrack(t, t.downloadUrl || '')));
        return;
      }

      // If no download URL, try using existing stream URL
      if (track.streamUrl) {
        console.log('Using existing stream URL:', track.streamUrl);
        playTrack(toPlayerTrack(track, track.streamUrl), playlist.map(t => toPlayerTrack(t, t.streamUrl || '')));
        return;
      }

      console.log('Getting stream URL for track:', track.id);
      
      // Get the stream URL from API
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/songs/${track.id}`);
      console.log('API Response:', response.data);

      if (!response.data?.data) {
        throw new Error('Invalid API response - no data');
      }

      const songData = response.data.data[0];
      const streamUrl = songData.downloadUrl || songData.streamUrl;

      if (!streamUrl) {
        throw new Error('No playable URL found for track');
      }

      // Update the track's stream URL
      track.streamUrl = streamUrl;
      
      // Play the track with its playlist
      playTrack(toPlayerTrack(track, streamUrl), playlist.map(t => toPlayerTrack(t, t.streamUrl || t.downloadUrl || '')));

    } catch (err) {
      console.error('Error playing track:', err);
      // Remove loading state
      if (button) {
        button.classList.remove('animate-pulse');
      }
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, track: SearchTrack) => {
    event.stopPropagation();
    const target = event.currentTarget;
    setMenuAnchorEl(target);
    setSelectedTrack(track);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTrack(null);
  };

  const TrackGrid = ({ tracks, title }: { tracks: SearchTrack[], title: string }) => (
    <>
      <SectionTitle variant="h5">{title}</SectionTitle>
      <Grid container spacing={3}>
        {tracks.map((track) => (
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
                  onClick={() => handleTrackClick(track, tracks)}
                  sx={{
                    ...(currentTrack?.id === track.id && {
                      opacity: 1,
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }),
                  }}
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
                      sx={{ 
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
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
    </>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <TrackGrid tracks={newReleases} title="New Releases" />
      <TrackGrid tracks={madeForYou} title="Made For You" />
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

export default Home;