import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (email, password) => 
    api.post('/auth/register', { email, password }),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Sessions API calls
export const sessionsAPI = {
  // Get all published sessions (public)
  getPublicSessions: () => 
    api.get('/sessions'),
  
  // Get user's own sessions (draft + published)
  getMySessions: () => 
    api.get('/sessions/my-sessions'),
  
  // Get a single user session
  getMySession: (id) => 
    api.get(`/sessions/my-sessions/${id}`),
  
  // Save or update a draft session
  saveDraft: (data) => 
    api.post('/sessions/save-draft', data),
  
  // Publish a session
  publishSession: (sessionId) => 
    api.post('/sessions/publish', { sessionId }),
  
  // Delete a session
  deleteSession: (id) => 
    api.delete(`/sessions/my-sessions/${id}`),
};

export default api; 