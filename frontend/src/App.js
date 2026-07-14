import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import BookmarksPage from './pages/BookmarksPage';
import Layout from './components/layout/Layout';

// Route guard: redirects to /login if not authenticated
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Route guard: redirects to /dashboard if already authenticated
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />

      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout><DashboardPage /></Layout>
        </PrivateRoute>
      } />
      <Route path="/video/:id" element={
        <PrivateRoute>
          <Layout><VideoPlayerPage /></Layout>
        </PrivateRoute>
      } />
      <Route path="/bookmarks" element={
        <PrivateRoute>
          <Layout><BookmarksPage /></Layout>
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
