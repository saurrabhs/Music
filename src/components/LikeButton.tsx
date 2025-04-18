import React from 'react';
import { IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Track, usePlaylist } from '../contexts/PlaylistContext';

interface LikeButtonProps {
  track: Track;
  color?: 'primary' | 'secondary' | 'default' | 'inherit';
}

const LikeButton: React.FC<LikeButtonProps> = ({ track, color = 'default' }) => {
  const { isLiked, toggleLiked } = usePlaylist();
  const liked = isLiked(track.id);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering parent click handlers
    toggleLiked(track);
  };

  return (
    <IconButton 
      onClick={handleClick}
      color={color}
      size="small"
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      {liked ? <Favorite /> : <FavoriteBorder />}
    </IconButton>
  );
};

export default LikeButton;
