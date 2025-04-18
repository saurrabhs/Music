import express from 'express';
import { auth } from 'firebase-admin';
import { db } from '../config/firebase-admin';

const router = express.Router();

// Middleware to verify Firebase auth token
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth().verifyIdToken(token);
        req.user = decodedToken;

        // Ensure user exists before proceeding
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get all playlists for a user
router.get('/', authenticateUser, async (req: express.Request, res) => {
    try {
        const userId = req.user.uid;
        const playlistsSnapshot = await db.collection('playlists')
            .where('userId', '==', userId)
            .get();

        const playlists = playlistsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ data: playlists });
    } catch (error) {
        console.error('Error getting playlists:', error);
        res.status(500).json({ error: 'Failed to get playlists' });
    }
});

// Create a new playlist
router.post('/', authenticateUser, async (req: express.Request, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.uid;

        if (!name) {
            return res.status(400).json({ error: 'Playlist name is required' });
        }

        const playlist = {
            name,
            userId,
            songs: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const docRef = await db.collection('playlists').add(playlist);
        res.status(201).json({ 
            data: { 
                id: docRef.id,
                ...playlist
            } 
        });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

// Add song to playlist
router.post('/:id/songs', authenticateUser, async (req: express.Request, res) => {
    try {
        const { id } = req.params;
        const { song } = req.body;
        const userId = req.user.uid;

        const playlistRef = db.collection('playlists').doc(id);
        const playlist = await playlistRef.get();

        if (!playlist.exists) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.data()?.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to modify this playlist' });
        }

        await playlistRef.update({
            songs: [...(playlist.data()?.songs || []), song],
            updatedAt: new Date()
        });

        res.json({ message: 'Song added to playlist' });
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        res.status(500).json({ error: 'Failed to add song to playlist' });
    }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', authenticateUser, async (req: express.Request, res) => {
    try {
        const { id, songId } = req.params;
        const userId = req.user.uid;

        const playlistRef = db.collection('playlists').doc(id);
        const playlist = await playlistRef.get();

        if (!playlist.exists) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.data()?.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to modify this playlist' });
        }

        const songs = playlist.data()?.songs || [];
        const updatedSongs = songs.filter((song: any) => song.id !== songId);

        await playlistRef.update({
            songs: updatedSongs,
            updatedAt: new Date()
        });

        res.json({ message: 'Song removed from playlist' });
    } catch (error) {
        console.error('Error removing song from playlist:', error);
        res.status(500).json({ error: 'Failed to remove song from playlist' });
    }
});

export default router;
