import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { musicService } from './services/musicService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize music service when server starts
(async () => {
    try {
        await musicService.initialize();
    } catch (error) {
        console.error('Failed to initialize music service:', error);
        process.exit(1);
    }
})();

// Music API endpoints
app.get('/api/search/songs', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const songs = await musicService.searchSongs(query);
        res.json({ data: { results: songs } });
    } catch (error) {
        console.error('Error searching songs:', error);
        res.status(500).json({ error: 'Failed to search songs' });
    }
});

app.get('/api/songs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Song ID is required' });
        }

        console.log('Fetching song details for ID:', id);
        const song = await musicService.getSongDetails(id);

        if (!song) {
            console.log('Song not found for ID:', id);
            return res.status(404).json({ error: 'Song not found' });
        }

        console.log('Found song:', song);
        res.json({ data: [song] }); // Return as array to match Saavn API format
    } catch (error: any) {
        console.error('Error getting song details:', error);
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ error: error.message || 'Failed to get song details' });
    }
});

app.get('/api/trending/songs', async (req, res) => {
    try {
        const songs = await musicService.getRecommendedSongs();
        res.json({ data: songs });
    } catch (error) {
        console.error('Error getting recommended songs:', error);
        res.status(500).json({ error: 'Failed to get recommended songs' });
    }
});

app.get('/api/playlists/top', async (req, res) => {
    try {
        const songs = await musicService.getTopCharts();
        res.json({ data: songs });
    } catch (error) {
        console.error('Error getting top charts:', error);
        res.status(500).json({ error: 'Failed to get top charts' });
    }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
