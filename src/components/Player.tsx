import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import {
  Box,
  Grid,
  IconButton,
  Slider,
  Typography,
  Avatar,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff,
  Repeat,
  RepeatOne,
  Shuffle,
} from '@mui/icons-material';
import { usePlayer } from '../contexts/PlayerContext';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // ✅ Added for logout detection

const Player: React.FC = () => {
  const { 
    currentTrack, 
    playNext, 
    playPrevious,
    isShuffleOn,
    toggleShuffle
  } = usePlayer();
  const [sound, setSound] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [repeat, setRepeat] = useState<'none' | 'one' | 'all'>('none');
  const progressInterval = useRef<number>();
  const prevVolumeRef = useRef(volume);

  // ✅ Stop audio on logout
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && sound) {
        sound.stop();
        sound.unload();
        setSound(null);
        setIsPlaying(false);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      }
    });
    return () => unsubscribe();
  }, [sound]);

  useEffect(() => {
    if (currentTrack?.streamUrl) {
      // Cleanup previous sound
      if (sound) {
        const wasPlaying = sound.playing();
        const currentVolume = sound.volume();
        const currentTime = sound.seek() as number;
        sound.unload();

        // Create new sound
        const newSound = new Howl({
          src: [currentTrack.streamUrl],
          html5: true,
          volume: currentVolume,
          autoplay: true, // Always auto-play when track changes
          onplay: () => {
            setIsPlaying(true);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
            progressInterval.current = window.setInterval(() => {
              if (newSound.playing()) {
                const currentSeek = newSound.seek() as number;
                if (!isNaN(currentSeek)) {
                  setProgress(currentSeek);
                }
              }
            }, 500);
          },
          onpause: () => {
            setIsPlaying(false);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          },
          onend: () => {
            setIsPlaying(false);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
            // Always call handleSongEnd when the song finishes
            handleSongEnd();
          },
          onload: () => {
            const dur = newSound.duration();
            if (!isNaN(dur)) {
              setDuration(dur);
            }
          },
          onstop: () => {
            setIsPlaying(false);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          }
        });

        setSound(newSound);
        setProgress(0);
      } else {
        // Initial load
        const newSound = new Howl({
          src: [currentTrack.streamUrl],
          html5: true,
          volume: volume,
          autoplay: true, // Auto-play first track
          onplay: () => {
            setIsPlaying(true);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
            progressInterval.current = window.setInterval(() => {
              if (newSound.playing()) {
                const currentSeek = newSound.seek() as number;
                if (!isNaN(currentSeek)) {
                  setProgress(currentSeek);
                }
              }
            }, 500);
          },
          onpause: () => {
            setIsPlaying(false);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          },
          onend: () => {
            setIsPlaying(false);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
            // Always call handleSongEnd when the song finishes
            handleSongEnd();
          },
          onload: () => {
            const dur = newSound.duration();
            if (!isNaN(dur)) {
              setDuration(dur);
            }
          },
          onstop: () => {
            setIsPlaying(false);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          }
        });

        setSound(newSound);
        setProgress(0);
      }

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        if (sound) {
          sound.unload();
        }
      };
    }
  }, [currentTrack]);

  const handleSongEnd = useCallback(() => {
    if (repeat === 'one') {
      if (sound) {
        sound.play();
      }
    } else {
      // Always play next song when current one ends
      playNext();
    }
  }, [repeat, playNext]);

  // Handle volume changes
  useEffect(() => {
    if (sound) {
      sound.volume(volume);
    }
  }, [volume]);

  const togglePlay = () => {
    if (sound) {
      if (sound.playing()) {
        sound.pause();
        setIsPlaying(false);
      } else {
        sound.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
    if (sound) {
      sound.volume(newVolume);
    }
    setVolume(newVolume);
    prevVolumeRef.current = newVolume;
  };

  const toggleMute = () => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      if (sound) {
        sound.volume(0);
      }
      setVolume(0);
    } else {
      if (sound) {
        sound.volume(prevVolumeRef.current);
      }
      setVolume(prevVolumeRef.current);
    }
  };

  const handleProgressChange = (_: Event, newValue: number | number[]) => {
    const newPosition = Array.isArray(newValue) ? newValue[0] : newValue;
    if (sound) {
      sound.seek(newPosition);
      setProgress(newPosition);
    }
  };

  const handleNext = () => {
    playNext();
  };

  const handlePrevious = () => {
    // If we're more than 3 seconds into the song, restart it
    if (sound && sound.seek() as number > 3) {
      sound.seek(0);
    } else {
      playPrevious();
    }
  };

  const handleRepeat = () => {
    setRepeat(current => {
      switch (current) {
        case 'none':
          return 'all';
        case 'all':
          return 'one';
        case 'one':
          return 'none';
      }
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        p: 2,
        zIndex: 1000,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Track Info - Left Side */}
        <Grid item xs={3}>
          {currentTrack && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                variant="rounded"
                sx={{ width: 56, height: 56, mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1" noWrap>
                  {currentTrack.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {currentTrack.artist}
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>

        {/* Playback Controls - Center */}
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Control Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton 
                onClick={toggleShuffle}
                sx={{ 
                  color: isShuffleOn ? 'primary.main' : 'inherit',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                <Shuffle />
              </IconButton>
              <IconButton onClick={handlePrevious}>
                <SkipPrevious />
              </IconButton>
              <IconButton 
                onClick={togglePlay}
                sx={{ 
                  mx: 1,
                  bgcolor: isPlaying ? 'primary.main' : 'transparent',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={handleNext}>
                <SkipNext />
              </IconButton>
              <IconButton 
                onClick={handleRepeat}
                sx={{ 
                  color: repeat !== 'none' ? 'primary.main' : 'inherit',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {repeat === 'one' ? <RepeatOne /> : <Repeat />}
              </IconButton>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                {formatTime(progress)}
              </Typography>
              <Slider
                value={progress}
                max={duration}
                onChange={handleProgressChange}
                sx={{
                  mx: 2,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: 'none',
                    }
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Volume Control - Right Side */}
        <Grid item xs={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <IconButton onClick={toggleMute}>
              {volume === 0 ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
              sx={{
                width: 100,
                ml: 2,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: 'none',
                  }
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Player;
