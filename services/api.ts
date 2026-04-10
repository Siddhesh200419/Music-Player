import axios from "axios";

const BASE_URL = "https://saavn.sumit.co/api";

export const apiService = {
  searchSongs: async (query: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/search/songs`, {
        params: { query },
      });
      return response.data.data.results;
    } catch (error) {
      console.error("Error searching songs:", error);
      throw error;
    }
  },

  getSongDetails: async (id: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/songs/${id}`);
      return response.data.data[0];
    } catch (error) {
      console.error("Error getting song details:", error);
      throw error;
    }
  },

  getArtistDetails: async (id: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/artists/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error getting artist details:", error);
      throw error;
    }
  },

  getArtistSongs: async (id: string, page: number = 0, limit: number = 10) => {
    try {
      const response = await axios.get(`${BASE_URL}/artists/${id}/songs`, {
        params: { page, limit },
      });
      return response.data.data.songs || response.data.data.results || response.data.data || [];
    } catch (error) {
      console.error("Error getting artist songs:", error);
      throw error;
    }
  },

  getArtistCounts: async (id: string) => {
    try {
      const [songsRes, albumsRes] = await Promise.all([
        axios.get(`${BASE_URL}/artists/${id}/songs`, { params: { page: 1, limit: 1 } }),
        axios.get(`${BASE_URL}/artists/${id}/albums`, { params: { page: 1, limit: 1 } })
      ]);
      return {
        songs: songsRes.data?.data?.total || 0,
        albums: albumsRes.data?.data?.total || 0
      };
    } catch (error) {
      return { songs: 0, albums: 0 };
    }
  },

  getTrendingSongs: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/search/songs`, {
        params: { query: "latest" },
      });
      const songs = response.data.data.results;
      console.log("API Result:", JSON.stringify(songs[0], null, 2));
      return songs;
    } catch (error) {
      console.error("Error getting trending songs:", error);
      throw error;
    }
  },

  searchArtists: async (query: string = "a", page: number = 1, limit: number = 10) => {
    try {
      const response = await axios.get(`${BASE_URL}/search/artists`, {
        params: { query, page, limit },
      });
      return response.data.data.results || [];
    } catch (error) {
      console.error("Error searching artists:", error);
      throw error;
    }
  },

  searchAlbums: async (query: string = "latest") => {
    try {
      const response = await axios.get(`${BASE_URL}/search/albums`, {
        params: { query },
      });
      return response.data.data.results;
    } catch (error) {
      console.error("Error searching albums:", error);
      throw error;
    }
  },

  getAlbumById: async (id: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/albums`, {
        params: { id },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error getting album details:", error);
      throw error;
    }
  },

  globalSearch: async (query: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: { query },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error in global search:", error);
      throw error;
    }
  },
};
