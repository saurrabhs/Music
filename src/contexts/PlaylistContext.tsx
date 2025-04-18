import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track as PlayerTrack } from './PlayerContext';
import { useAuth } from './AuthContext';
import { playlistService, Playlist as FirebasePlaylist } from '../services/playlistService';

// Common Track interface used across the app
export interface Track extends PlayerTrack {
  id: string;
  title: string;
  artist: string;
  streamUrl: string;
  thumbnail?: string;
  duration?: string | null;
  album?: string;
  year?: string;
  language?: string;
  perma_url?: string;
}

interface Playlist {
  id: string;
  name: string;
  userId: string;
  tracks: Track[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  likedSongs: Track[];
  createPlaylist: (name: string) => Promise<Playlist>;
  deletePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  toggleLiked: (track: Track) => Promise<void>;
  isLiked: (trackId: string) => boolean;
  loadPlaylists: () => Promise<void>;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  addPlaylist: (name: string, tracks: Track[]) => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const { currentUser } = useAuth();

  // Load user's playlists from Firebase
  const loadPlaylists = async () => {
    if (!currentUser) {
      setPlaylists([]);
      return;
    }

    try {
      console.log('Loading playlists for user:', currentUser.uid);
      const userPlaylists = await playlistService.getUserPlaylists(currentUser.uid);
      console.log('Loaded playlists:', userPlaylists);
      
      const mappedPlaylists = userPlaylists.map(p => ({
        id: p.id,
        name: p.name,
        userId: p.userId,
        tracks: Array.isArray(p.songs) ? p.songs.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          streamUrl: song.streamUrl,
          thumbnail: song.thumbnail,
          duration: song.duration,
          album: song.album,
          year: song.year,
          language: song.language,
          perma_url: song.perma_url
        })) : [],
        isDefault: p.isDefault || false,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }));

      console.log('Mapped playlists:', mappedPlaylists);
      setPlaylists(mappedPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [currentUser]);

  const createPlaylist = async (name: string): Promise<Playlist> => {
    if (!currentUser) throw new Error('User must be logged in to create a playlist');

    const playlistId = await playlistService.createPlaylist(currentUser.uid, name, false);
    const newPlaylist: Playlist = {
      id: playlistId,
      name,
      userId: currentUser.uid,
      tracks: [],
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPlaylists(prev => [...prev, newPlaylist]); // Immediately add to state
    return newPlaylist;
  };

  const deletePlaylist = async (id: string) => {
    if (!currentUser) return;
    try {
      await playlistService.deletePlaylist(id);
      setPlaylists(prev => prev.filter(playlist => !playlist.isDefault && playlist.id !== id));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const addToPlaylist = async (playlistId: string, track: Track) => {
    await playlistService.addSongToPlaylist(playlistId, track);
    // Update the playlist in state immediately
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          tracks: [...p.tracks, track]
        };
      }
      return p;
    }));
  };

  const removeFromPlaylist = async (playlistId: string, trackId: string) => {
    if (!currentUser) return;

    try {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) return;

      const track = playlist.tracks.find(t => t.id === trackId);
      if (!track) return;

      await playlistService.removeSongFromPlaylist(playlistId, track);
      await loadPlaylists(); // Reload playlists to ensure we have the latest data
    } catch (error) {
      console.error('Error removing song from playlist:', error);
    }
  };

  const getLikedPlaylist = () => {
    if (!currentUser) return null;
    return playlists.find(p => p.isDefault);
  };
  
  const toggleLiked = async (track: Track) => {
    if (!currentUser) return;

    try {
      const likedPlaylist = playlists.find(p => p.isDefault);
      if (!likedPlaylist) return;

      const isCurrentlyLiked = isLiked(track.id);

      // Update state immediately for responsive UI
      setPlaylists(prev => prev.map(p => {
        if (p.isDefault) {
          return {
            ...p,
            tracks: isCurrentlyLiked
              ? p.tracks.filter(t => t.id !== track.id)
              : [...p.tracks, track]
          };
        }
        return p;
      }));

      // Then sync with server in the background
      if (isCurrentlyLiked) {
        await playlistService.removeSongFromPlaylist(likedPlaylist.id, track);
      } else {
        await playlistService.addSongToPlaylist(likedPlaylist.id, track);
      }
    } catch (error) {
      console.error('Error toggling liked song:', error);
      // Revert state on error
      await loadPlaylists();
    }
  };

  const isLiked = (trackId: string): boolean => {
    const likedPlaylist = playlists.find(p => p.isDefault);
    return likedPlaylist?.tracks?.some(track => track.id === trackId) || false;
  };

  const addPlaylist = async (name: string, tracks: Track[]) => {
    if (!currentUser) return;

    try {
      console.log('Creating playlist:', name, 'with tracks:', tracks);
      const playlistId = await playlistService.createPlaylist(currentUser.uid, name, false);
      console.log('Created playlist with ID:', playlistId);
      
      // Add all tracks to the playlist
      for (const track of tracks) {
        console.log('Adding track to playlist:', track.title);
        await playlistService.addSongToPlaylist(playlistId, track);
      }

      console.log('All tracks added, reloading playlists...');
      await loadPlaylists(); // Reload to ensure we have the latest data
      
      // Get the updated playlist to verify
      const updatedPlaylist = await playlistService.getPlaylist(playlistId);
      console.log('Updated playlist:', updatedPlaylist);
    } catch (error) {
      console.error('Error creating playlist with tracks:', error);
      throw error; // Re-throw to handle in the component
    }
  };

  // Get the liked songs for the context value
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);

  useEffect(() => {
    const likedPlaylist = playlists.find(p => p.isDefault);
    setLikedSongs(likedPlaylist?.tracks || []);
  }, [playlists]);

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        currentPlaylist,
        likedSongs,
        createPlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        toggleLiked,
        isLiked,
        loadPlaylists,
        setCurrentPlaylist,
        addPlaylist
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};
