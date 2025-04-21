import axios from 'axios';

// Import Track interface from PlayerContext
import { Track as PlayerTrack } from '../contexts/PlayerContext';

// Extend PlayerTrack interface for search results
interface SearchResult extends Omit<PlayerTrack, 'streamUrl'> {
    downloadUrl?: string;
    streamUrl?: string;
}

interface SongDetails {
    id: string;
    url: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration: number;
    album: string;
    year: string;
    language: string;
}

class MusicService {
    private baseUrl = process.env.MUSIC_API_BASE_URL || 'https://saavn.dev/api';
    private axios = axios.create({
        baseURL: this.baseUrl,
        timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; MusicApp/1.0)'
        }
    });

    private transformSearchResponse(song: any): SearchResult {
        // Get the highest quality image URL
        const imageUrl = song.image?.find((img: any) => img.quality === '500x500')?.url ||
            song.image?.find((img: any) => img.quality === '150x150')?.url ||
            song.image?.find((img: any) => img.quality === '50x50')?.url ||
            (typeof song.image === 'string' ? song.image : null);

        // Get the download URL if available
        let downloadUrl = '';
        if (Array.isArray(song.downloadUrl)) {
            const qualities = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
            for (const quality of qualities) {
                const url = song.downloadUrl.find((d: any) => d.quality === quality)?.url;
                if (url) {
                    downloadUrl = url;
                    break;
                }
            }
        } else if (typeof song.downloadUrl === 'string') {
            downloadUrl = song.downloadUrl;
        }

        // Get primary artist names
        const artist = song.primaryArtists || 
            (Array.isArray(song.artists?.primary) ? 
                song.artists.primary.map((a: any) => a.name).join(', ') : 
                song.artist);

        // Use the download URL as the stream URL
        const streamUrl = downloadUrl || song.downloadUrl?.[0]?.url || song.downloadUrl;

        if (!streamUrl) {
            console.warn('No stream URL found for song:', song.id);
        }

        return {
            id: song.id,
            title: song.name || song.title,
            artist: artist,
            thumbnail: imageUrl,
            duration: song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : null,
            downloadUrl: downloadUrl,
            streamUrl: streamUrl, // Use download URL for playback
            album: song.album?.name || song.album,
            year: song.year,
            language: song.language
        };
    }

    private transformSongDetails(song: any): SongDetails {
        // Get the highest quality image URL
        const imageUrl = song.image?.find((img: any) => img.quality === '500x500')?.url ||
            song.image?.find((img: any) => img.quality === '150x150')?.url ||
            song.image?.find((img: any) => img.quality === '50x50')?.url;

        // Get the highest quality download URL available
        const downloadUrls = song.downloadUrl;
        let streamUrl = '';
        if (Array.isArray(downloadUrls)) {
            // Find the highest quality version (320kbps preferred)
            const qualities = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
            for (const quality of qualities) {
                const url = downloadUrls.find((d: any) => d.quality === quality)?.url;
                if (url) {
                    streamUrl = url;
                    break;
                }
            }
        }

        // Get primary artist names
        const artists = song.artists?.primary?.map((a: any) => a.name).join(', ') || '';

        return {
            id: song.id,
            url: streamUrl,
            title: song.name,
            artist: artists,
            thumbnail: imageUrl || '',
            duration: song.duration || 0,
            album: song.album?.name || '',
            year: song.year || '',
            language: song.language || ''
        };
    }

    async initialize(): Promise<void> {
        try {
            // Test the API connection with a simple search
            const response = await this.axios.get('search/songs', {
                params: {
                    query: 'test'
                }
            });
            
            if (!response.data?.data) {
                throw new Error('API initialization failed');
            }
            console.log('Music service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize music service:', error);
            throw error;
        }
    }

    async searchSongs(query: string): Promise<SearchResult[]> {
        try {
            console.log('Searching for:', query);
            const response = await this.axios.get('search/songs', {
                params: { query }
            });
            
            console.log('Search API Raw Response:', JSON.stringify(response.data));
            let songs: any[] = [];
            if (response.data?.data?.results) {
                songs = response.data.data.results;
            } else if (response.data?.results) {
                songs = response.data.results;
            } else {
                console.error('Unexpected API response structure:', response.data);
                throw new Error('Unexpected API response structure');
            }
            const results = songs.map((song: any) => {
                const transformed = this.transformSearchResponse(song);
                console.log('Transformed song:', transformed);
                return transformed;
            });
            return results;
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null) {
                if ('response' in error && error.response) {
                    // @ts-ignore
                    console.error('Error searching songs:', error.response.status, error.response.data);
                } else if ('request' in error && error.request) {
                    // @ts-ignore
                    console.error('No response received from music API:', error.request);
                } else if ('message' in error && typeof error.message === 'string') {
                    // @ts-ignore
                    console.error('Error setting up music API request:', error.message);
                } else {
                    console.error('Unknown error in music API request:', error);
                }
            } else {
                console.error('Unknown error type in music API request:', error);
            }
            throw new Error('Music API is currently unavailable. Please try again later.');
        }
    }

    async getSongDetails(id: string): Promise<SongDetails | null> {
        try {
            console.log('Getting details for song:', id);
            // First try to get song details directly
            const response = await this.axios.get(`songs/${id}`);
            
            if (!response.data?.data) {
                // If direct lookup fails, try searching for the song
                console.log('Song not found by ID, trying search...');
                const searchResponse = await this.axios.get('search/songs', {
                    params: { query: id }
                });

                if (!searchResponse.data?.data?.results?.length) {
                    throw new Error('Song not found');
                }

                // Find the exact match by ID
                const song = searchResponse.data.data.results.find((s: any) => s.id === id);
                if (!song) {
                    throw new Error('Song not found');
                }

                return this.transformSongDetails(song);
            }
            
            // The API returns an array of songs, get the first one
            const songs = response.data.data;
            const song = Array.isArray(songs) ? songs[0] : songs;
            
            if (!song) {
                throw new Error('Song not found');
            }

            return this.transformSongDetails(song);
        } catch (error) {
            console.error('Error getting song details:', error);
            return null;
        }
    }

    async getRecommendedSongs(): Promise<SearchResult[]> {
        try {
            // Get trending songs as recommendations
            const response = await this.axios.get('trending/songs');
            
            if (response.data?.data) {
                return response.data.data
                    .slice(0, Number(process.env.REACT_APP_MAX_RESULTS) || 10)
                    .map(this.transformSearchResponse);
            }
            return [];
        } catch (error) {
            console.error('Error getting recommended songs:', error);
            return [];
        }
    }

    async getTopCharts(): Promise<SearchResult[]> {
        try {
            // Get top charts
            const response = await this.axios.get('playlists/top');
            
            if (response.data?.data) {
                return response.data.data
                    .slice(0, Number(process.env.REACT_APP_MAX_RESULTS) || 10)
                    .map(this.transformSearchResponse);
            }
            return [];
        } catch (error) {
            console.error('Error getting top charts:', error);
            return [];
        }
    }
}

export const musicService = new MusicService();
