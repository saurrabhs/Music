import React, { createContext, useContext, useState, useCallback } from 'react';

interface Track {
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

interface PlayerContextType {
  currentTrack: Track | null;
  currentPlaylist: Track[] | null;
  playTrack: (track: Track, playlist?: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  isShuffleOn: boolean;
  toggleShuffle: () => void;
  stop?: () => void;
  setStopHandler?: (fn: () => void) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [stopHandler, setStopHandlerState] = useState<(() => void) | null>(null);

  const setStopHandler = (fn: () => void) => {
    setStopHandlerState(() => fn);
  };

  const stop = () => {
    stopHandler?.();
  };

  const shuffleArray = (array: number[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateShuffledIndices = (length: number, currentIdx: number) => {
    const indices = Array.from({ length }, (_, i) => i).filter(i => i !== currentIdx);
    const shuffled = shuffleArray(indices);
    return [currentIdx, ...shuffled];
  };

  const findTrackIndex = (track: Track, playlist: Track[]) => {
    return playlist.findIndex(t => t.id === track.id);
  };

  const playTrack = useCallback((track: Track, playlist?: Track[]) => {
    setCurrentTrack(track);
    if (playlist) {
      setCurrentPlaylist(playlist);
      const index = findTrackIndex(track, playlist);
      setCurrentIndex(index);

      if (isShuffleOn) {
        setShuffledIndices(generateShuffledIndices(playlist.length, index));
      }
    }
  }, [isShuffleOn]);

  const getNextIndex = () => {
    if (!currentPlaylist) return -1;

    if (isShuffleOn) {
      const currentPos = shuffledIndices.indexOf(currentIndex);
      if (currentPos < shuffledIndices.length - 1) {
        return shuffledIndices[currentPos + 1];
      } else {
        const newIndices = generateShuffledIndices(currentPlaylist.length, shuffledIndices[0]);
        setShuffledIndices(newIndices);
        return newIndices[1];
      }
    } else {
      return currentIndex + 1 >= currentPlaylist.length ? 0 : currentIndex + 1;
    }
  };

  const getPreviousIndex = () => {
    if (!currentPlaylist) return -1;

    if (isShuffleOn) {
      const currentPos = shuffledIndices.indexOf(currentIndex);
      if (currentPos > 0) {
        return shuffledIndices[currentPos - 1];
      } else {
        return shuffledIndices[shuffledIndices.length - 1];
      }
    } else {
      return currentIndex - 1 < 0 ? currentPlaylist.length - 1 : currentIndex - 1;
    }
  };

  const playNext = useCallback(() => {
    if (!currentPlaylist) return;

    const nextIndex = getNextIndex();
    if (nextIndex !== -1) {
      const nextTrack = currentPlaylist[nextIndex];
      playTrack(nextTrack, currentPlaylist);
      setCurrentIndex(nextIndex);
    }
  }, [currentPlaylist, currentIndex, isShuffleOn, playTrack]);

  const playPrevious = useCallback(() => {
    if (!currentPlaylist) return;

    const prevIndex = getPreviousIndex();
    if (prevIndex !== -1) {
      const prevTrack = currentPlaylist[prevIndex];
      playTrack(prevTrack, currentPlaylist);
      setCurrentIndex(prevIndex);
    }
  }, [currentPlaylist, currentIndex, isShuffleOn, playTrack]);

  const toggleShuffle = useCallback(() => {
    setIsShuffleOn(prev => {
      const newShuffleState = !prev;
      if (newShuffleState && currentPlaylist) {
        setShuffledIndices(generateShuffledIndices(currentPlaylist.length, currentIndex));
      }
      return newShuffleState;
    });
  }, [currentPlaylist, currentIndex]);

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, 
      currentPlaylist,
      playTrack, 
      playNext,
      playPrevious,
      isShuffleOn,
      toggleShuffle,
      stop,
      setStopHandler
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export type { Track };
