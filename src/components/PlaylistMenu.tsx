import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider
} from '@mui/material';
import { Add, PlaylistAdd, Favorite, FavoriteBorder } from '@mui/icons-material';
import { usePlaylist } from '../contexts/PlaylistContext';
import { Track } from '../contexts/PlayerContext';

interface PlaylistMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  track: Track;
}

export const PlaylistMenu: React.FC<PlaylistMenuProps> = ({ anchorEl, onClose, track }) => {
  const { playlists, createPlaylist, addToPlaylist, toggleLiked, isLiked } = usePlaylist();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      try {
        const playlist = await createPlaylist(newPlaylistName.trim());
        await addToPlaylist(playlist.id, track);
        setNewPlaylistName('');
        setIsCreateDialogOpen(false);
        onClose();
      } catch (error) {
        console.error('Error creating playlist:', error);
      }
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await addToPlaylist(playlistId, track);
      onClose();
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  };

  const handleToggleLike = async () => {
    try {
      await toggleLiked(track);
      onClose();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            minWidth: 200,
            marginTop: '2px',
            marginLeft: '-14px'
          }
        }}
      >
        <MenuItem onClick={handleToggleLike}>
          <ListItemIcon>
            {isLiked(track.id) ? (
              <Favorite fontSize="small" color="primary" />
            ) : (
              <FavoriteBorder fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {isLiked(track.id) ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
          </ListItemText>
        </MenuItem>

        <Divider />

        {playlists
          .filter(playlist => !playlist.isDefault)
          .map(playlist => (
            <MenuItem
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
            >
              <ListItemIcon>
                <PlaylistAdd fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add to {playlist.name}</ListItemText>
            </MenuItem>
          ))}

        <MenuItem onClick={() => setIsCreateDialogOpen(true)}>
          <ListItemIcon>
            <Add fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create New Playlist</ListItemText>
        </MenuItem>
      </Menu>

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
    </>
  );
};
