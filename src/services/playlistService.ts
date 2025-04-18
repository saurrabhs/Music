import { 
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
    query,
    where,
    addDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Track } from '../contexts/PlayerContext';

export interface Playlist {
    id: string;
    name: string;
    userId: string;
    songs: Track[];
    createdAt: Date;
    updatedAt: Date;
    isDefault: boolean;
}

export const playlistService = {
    // Create a new playlist
    async createPlaylist(userId: string, name: string, isDefault: boolean = false): Promise<string> {
        const playlistRef = await addDoc(collection(db, 'playlists'), {
            name,
            userId,
            songs: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isDefault
        });

        return playlistRef.id;
    },

    // Get all playlists for a user
    async getUserPlaylists(userId: string): Promise<Playlist[]> {
        const playlistsRef = collection(db, 'playlists');
        const q = query(playlistsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const playlists = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            console.log('Raw playlist data:', { id: doc.id, data });

            // Convert Firebase Timestamp to Date and ensure songs array exists
            const songs = (data.songs || []).map((song: any) => {
                // Parse addedAt from ISO string if it exists
                let addedAt;
                try {
                    addedAt = song.addedAt ? new Date(song.addedAt) : new Date();
                } catch (e) {
                    addedAt = new Date();
                }

                return {
                    id: song.id || '',
                    title: song.title || '',
                    artist: song.artist || 'Unknown Artist',
                    streamUrl: song.streamUrl || '',
                    thumbnail: song.thumbnail || '',
                    duration: song.duration?.toString() || '0',
                    album: song.album || '',
                    year: song.year?.toString() || '',
                    language: song.language || '',
                    perma_url: song.perma_url || '',
                    addedAt
                };
            });

            console.log('Processed songs:', songs);

            const playlist = {
                id: doc.id,
                name: data.name || '',
                userId: data.userId || '',
                songs: songs,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                isDefault: data.isDefault || false
            } as Playlist;

            console.log('Processed playlist:', playlist);
            return playlist;
        }));

        // Ensure Liked Songs playlist exists
        const likedPlaylist = playlists.find(p => p.isDefault);
        if (!likedPlaylist) {
            // Create a document with a specific ID for Liked Songs
            const likedPlaylistRef = doc(db, 'playlists', `liked_${userId}`);
            await setDoc(likedPlaylistRef, {
                name: 'Liked Songs',
                userId,
                songs: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true
            });

            playlists.push({
                id: likedPlaylistRef.id,
                name: 'Liked Songs',
                userId,
                songs: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: true
            });
        }

        return playlists;
    },

    // Add a song to a playlist
    async addSongToPlaylist(playlistId: string, song: Track): Promise<void> {
        const playlistRef = doc(db, 'playlists', playlistId);
        const playlistSnap = await getDoc(playlistRef);
        
        if (!playlistSnap.exists()) {
            throw new Error('Playlist not found');
        }

        const existingSongs = playlistSnap.data()?.songs || [];
        const songExists = existingSongs.some((s: any) => s.id === song.id);

        if (!songExists) {
            // Convert the song to a plain object and ensure no undefined values
            const songData = {
                id: song.id || '',
                title: song.title || '',
                artist: song.artist || 'Unknown Artist',
                streamUrl: song.streamUrl || '',
                thumbnail: song.thumbnail || '',
                duration: song.duration?.toString() || '0',
                album: song.album || '',
                year: song.year?.toString() || '',
                language: song.language || '',
                perma_url: song.perma_url || '',
                addedAt: new Date().toISOString() // Store as ISO string for consistency
            };

            // Log the data being saved
            console.log('Adding song to playlist:', { playlistId, songData });

            try {
                await updateDoc(playlistRef, {
                    songs: arrayUnion(songData),
                    updatedAt: new Date()
                });
                console.log('Successfully added song to playlist');
            } catch (error) {
                console.error('Error adding song to playlist:', error);
                throw error;
            }
        }
    },

    // Remove song from playlist
    async removeSongFromPlaylist(playlistId: string, song: Track): Promise<void> {
        const playlistRef = doc(db, 'playlists', playlistId);
        const playlistSnap = await getDoc(playlistRef);
        
        if (!playlistSnap.exists()) {
            throw new Error('Playlist not found');
        }

        const songs = playlistSnap.data()?.songs || [];
        const updatedSongs = songs.filter((s: Track) => s.id !== song.id);

        await updateDoc(playlistRef, {
            songs: updatedSongs,
            updatedAt: new Date()
        });
    },

    // Get a specific playlist
    async getPlaylist(playlistId: string): Promise<Playlist | null> {
        const playlistRef = doc(db, 'playlists', playlistId);
        const playlistSnap = await getDoc(playlistRef);
        
        if (!playlistSnap.exists()) {
            return null;
        }

        return {
            ...playlistSnap.data(),
            createdAt: playlistSnap.data().createdAt.toDate(),
            updatedAt: playlistSnap.data().updatedAt.toDate()
        } as Playlist;
    },

    // Delete a playlist
    async deletePlaylist(playlistId: string): Promise<void> {
        const playlistRef = doc(db, 'playlists', playlistId);
        await deleteDoc(playlistRef);
    }
};
