import axios from 'axios';

const API_BASE = process.env.REACT_APP_API || 'https://assignmentintern.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
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
  register: (name, email, password) => 
    api.post('/api/auth/register', { name, email, password }),
  
  login: (email, password) => 
    api.post('/api/auth/login', { email, password }),
  
  getCurrentUser: () => 
    api.get('/api/auth/me'),
};

// Sessions API calls
export const sessionsAPI = {
  // Get all published sessions (public)
  getPublicSessions: () => 
    api.get('/api/sessions'),
  
  // Get user's own sessions (draft + published)
  getMySessions: () => 
    api.get('/api/sessions/my-sessions'),
  
  // Get a single user session
  getMySession: (id) => 
    api.get(`/api/sessions/my-sessions/${id}`),
  
  // Save or update a draft session
  saveDraft: (data) => 
    api.post('/api/sessions/save-draft', data),
  
  // Publish a session
  publishSession: (sessionId) => 
    api.post('/api/sessions/publish', { sessionId }),
  
  // Delete a session
  deleteSession: (id) => 
    api.delete(`/api/sessions/my-sessions/${id}`),
};

export default api; 