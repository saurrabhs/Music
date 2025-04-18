import { Request, Response } from 'express';
import { musicService } from '../services/musicService';

export const searchSongs = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const songs = await musicService.searchSongs(query);
        res.json({ results: songs });
    } catch (error) {
        console.error('Error in search endpoint:', error);
        res.status(500).json({ error: 'Failed to search songs' });
    }
};

export const getSongDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Song ID is required' });
        }

        const songDetails = await musicService.getSongDetails(id);
        res.json(songDetails);
    } catch (error) {
        console.error('Error in get song details endpoint:', error);
        res.status(500).json({ error: 'Failed to get song details' });
    }
};

export const getRecommendedSongs = async (req: Request, res: Response) => {
    try {
        const songs = await musicService.getRecommendedSongs();
        res.json({ results: songs });
    } catch (error) {
        console.error('Error in recommended songs endpoint:', error);
        res.status(500).json({ error: 'Failed to get recommended songs' });
    }
};

export const getTopCharts = async (req: Request, res: Response) => {
    try {
        const songs = await musicService.getTopCharts();
        res.json({ results: songs });
    } catch (error) {
        console.error('Error in top charts endpoint:', error);
        res.status(500).json({ error: 'Failed to get top charts' });
    }
};
