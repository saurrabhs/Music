export interface SearchOptions {
  filter?: 'songs' | 'videos' | 'albums' | 'artists' | 'playlists';
}

export interface SearchResponse {
  contents?: {
    tabbedSearchResultsRenderer?: {
      tabs?: Array<{
        tabRenderer?: {
          content?: {
            sectionListRenderer?: {
              contents?: Array<{
                musicShelfRenderer?: {
                  contents?: Array<any>;
                };
              }>;
            };
          };
        };
      }>;
    };
  };
}

export interface SongDetails {
  streamingData?: {
    adaptiveFormats?: Array<{
      url: string;
    }>;
  };
}

export interface YTMusicAPI {
  search(query: string, options?: SearchOptions): Promise<SearchResponse>;
  getSongDetails(videoId: string): Promise<SongDetails>;
  getPlaylist(playlistId: string): Promise<any>;
  getArtist(artistId: string): Promise<any>;
}

const YTMusic: YTMusicAPI;
export default YTMusic; 