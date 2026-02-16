import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
      console.log('API createBatch called with:', batchData);
      const response = await this.api.post('/batches', batchData);
      console.log('API createBatch response:', response.data);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('API createBatch error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async getBatchById(batchId) {
    return this.api.get(`/batches/${batchId}`);
  }

  async getBatchByBatchNumber(batchNumber) {
    try {
      const response = await this.api.get(`/batches/batch-number/${batchNumber}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async updateBatchStatus(batchId, status) {
    // Validate batch ID
    if (!batchId || batchId === 'undefined' || batchId === 'null') {
      return { success: false, message: 'Invalid batch ID' };
    }
    try {
      const response = await this.api.patch(`/batches/${batchId}/status`, { status });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async deleteBatch(batchId) {
    // Validate batch ID
    if (!batchId || batchId === 'undefined' || batchId === 'null') {
      return { success: false, message: 'Invalid batch ID' };
    }
    try {
      const response = await this.api.delete(`/batches/${batchId}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async getBatchTimeline(batchId) {
    // Validate batch ID
    if (!batchId || batchId === 'undefined' || batchId === 'null') {
      return { success: false, message: 'Invalid batch ID' };
    }
    try {
      const response = await this.api.get(`/batches/${batchId}/timeline`);
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

  async getCompanyProfile() {
    try {
      const response = await this.api.get('/profiles/company');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async createFarmerProfile(profileData) {
    try {
      console.log('Creating farmer profile with data:', profileData);
      const response = await this.api.post('/profiles/farmer', profileData);
      console.log('Farmer profile response:', response.data);
      
      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message || 'Failed to save profile' };
      }
    } catch (error) {
      console.error('Farmer profile error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      return { success: false, message: errorMessage };
    }
  }

  async getPurchases(params = {}) {
    try {
      const response = await this.api.get('/purchases', { params });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async createPurchase(purchaseData) {
    try {
      const response = await this.api.post('/purchases', purchaseData);
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
  getById: (batchId) => apiClient.getBatchById(batchId),
  getByBatchNumber: (batchNumber) => apiClient.getBatchByBatchNumber(batchNumber),
  updateStatus: (batchId, status) => apiClient.updateBatchStatus(batchId, status),
  delete: (batchId) => apiClient.deleteBatch(batchId),
  getTimeline: (batchId) => apiClient.getBatchTimeline(batchId),
};

export const profilesAPI = {
  getFarmerProfile: (userId) => apiClient.getFarmerProfile(userId),
  getCompanyProfile: () => apiClient.getCompanyProfile(),
  createFarmerProfile: (profileData) => apiClient.createFarmerProfile(profileData),
};

export const purchasesAPI = {
  getAll: (params) => apiClient.getPurchases(params),
  create: (purchaseData) => apiClient.createPurchase(purchaseData),
};

export const adminAPI = {
  getDashboard: async () => {
    try {
      const response = await apiClient.api.get('/admin/stats');
      if (response.data.success) {
        // Fetch pending farmers and batches separately
        const [farmersRes, batchesRes] = await Promise.all([
          apiClient.api.get('/admin/farmers/pending'),
          apiClient.api.get('/admin/batches/pending')
        ]);
        
        console.log('API Response - pending farmers:', farmersRes.data);
        console.log('API Response - pending batches:', batchesRes.data);
        
        return {
          success: true,
          data: {
            pendingFarmers: farmersRes.data?.data || [],
            pendingBatches: batchesRes.data?.data || [],
            purchases: response.data.data?.purchases?.recent || []
          }
        };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Admin dashboard error:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },
  approveFarmer: async (farmerId) => {
    console.log('adminAPI.approveFarmer called with:', farmerId);
    try {
      const response = await apiClient.api.patch(`/admin/farmers/${farmerId}/approve`);
      console.log('approveFarmer response:', response.data);
      return { success: response.data.success, data: response.data.data };
    } catch (error) {
      console.error('Approve farmer error:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },
  rejectFarmer: async (farmerId) => {
    try {
      const response = await apiClient.api.patch(`/admin/farmers/${farmerId}/reject`);
      return { success: response.data.success, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },
  approveBatch: async (batchId) => {
    try {
      const response = await apiClient.api.patch(`/admin/batches/${batchId}/approve`);
      return { success: response.data.success, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },
};

export default apiClient;
