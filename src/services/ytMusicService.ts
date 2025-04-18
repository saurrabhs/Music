import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_YT_MUSIC_API_URL || 'http://localhost:3001/api';

export interface SearchResult {
  videoId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: string;
}

export interface PlaylistItem {
  videoId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: string;
}

export interface Category {
  title: string;
  items: PlaylistItem[];
}

class YTMusicService {
  private async request<T>(endpoint: string, params?: any): Promise<T> {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
      return response.data;
    } catch (error) {
      console.error('YTMusic API Error:', error);
      throw error;
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    return this.request<SearchResult[]>('/search', { query });
  }

  async getTrendingMusic(): Promise<Category[]> {
    return this.request<Category[]>('/trending');
  }

  async getPopularPlaylists(): Promise<Category[]> {
    return this.request<Category[]>('/playlists/popular');
  }

  async getNewReleases(): Promise<Category[]> {
    return this.request<Category[]>('/new-releases');
  }

  async getArtistDetails(artistId: string): Promise<any> {
    return this.request(`/artists/${artistId}`);
  }

  async getStreamUrl(videoId: string): Promise<string> {
    const response = await this.request<{ url: string }>(`/stream/${videoId}`);
    return response.url;
  }
}

export const ytMusicService = new YTMusicService();
export default ytMusicService;