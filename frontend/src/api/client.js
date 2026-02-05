import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIClient {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  async signup(userData) {
    try {
      const response = await this.api.post('/auth/signup', userData);
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('API signup error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/auth/login', credentials);
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.data;
        localStorage.setItem('user', JSON.stringify(userData.user));
        return { success: true, data: userData };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  async getBatches(params = {}) {
    try {
      const response = await this.api.get('/batches', { params });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async createBatch(batchData) {
    try {
      const response = await this.api.post('/batches', batchData);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async getFarmerProfile(userId) {
    try {
      const response = await this.api.get(`/profiles/farmer${userId ? `/${userId}` : ''}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
}

const apiClient = new APIClient();

export const authAPI = {
  signup: (userData) => apiClient.signup(userData),
  login: (credentials) => apiClient.login(credentials),
  getCurrentUser: () => apiClient.getCurrentUser(),
  getUser: () => apiClient.getUser(),
  logout: () => apiClient.logout(),
  isAuthenticated: () => apiClient.isAuthenticated(),
};

export const batchesAPI = {
  getAll: (params) => apiClient.getBatches(params),
  create: (batchData) => apiClient.createBatch(batchData),
};

export const profilesAPI = {
  getFarmerProfile: (userId) => apiClient.getFarmerProfile(userId),
};

export const adminAPI = {
  getDashboard: () => ({ success: true, data: { pendingFarmers: [], pendingBatches: [], purchases: [] } }),
  approveFarmer: () => ({ success: true }),
  rejectFarmer: () => ({ success: true }),
  approveBatch: () => ({ success: true }),
};

export default apiClient;