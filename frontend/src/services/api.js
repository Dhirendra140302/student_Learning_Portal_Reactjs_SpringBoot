import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to login
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

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};

// ── Videos ───────────────────────────────────────────────────
export const videoAPI = {
  getAll:       ()          => api.get('/videos'),
  getById:      (id)        => api.get(`/videos/${id}`),
  search:       (q)         => api.get('/videos/search', { params: { q } }),
  getBySubject: (subject)   => api.get(`/videos/subject/${encodeURIComponent(subject)}`),
  getSubjects:  ()          => api.get('/videos/subjects'),
};

// ── Bookmarks ─────────────────────────────────────────────────
export const bookmarkAPI = {
  getForVideo:  (videoId)           => api.get(`/bookmarks/video/${videoId}`),
  getAll:       ()                  => api.get('/bookmarks'),
  create:       (data)              => api.post('/bookmarks', data),
  update:       (id, data)          => api.put(`/bookmarks/${id}`, data),
  delete:       (id)                => api.delete(`/bookmarks/${id}`),
};

// ── Watch Progress ────────────────────────────────────────────
export const progressAPI = {
  save:              (data)    => api.post('/progress', data),
  getForVideo:       (videoId) => api.get(`/progress/video/${videoId}`),
  getContinueWatching: ()      => api.get('/progress/continue-watching'),
  getRecentlyWatched:  ()      => api.get('/progress/recently-watched'),
};

export default api;
