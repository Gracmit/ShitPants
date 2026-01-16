import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/game';

const gameService = {
  createGame: async (gameData) => {
    const response = await axios.post(`${API_BASE_URL}/create`, gameData);
    return response.data;
  },
  getGameStatus: async (gameId) => {
    const response = await axios.get(`${API_BASE_URL}/status/${gameId}`);
    return response.data;
  },
  getGames: async () => {
    const response = await axios.get(`${API_BASE_URL}/`);
    return response.data;
  }
};

export default gameService;