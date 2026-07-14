import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI, progressAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/video/VideoCard';
import { formatTime, timeAgo } from '../utils/time';
// Styles loaded from src/index.css

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [videos,          setVideos]          = useState([]);
  const [subjects,        setSubjects]        = useState([]);
  const [continueList,    setContinueList]    = useState([]);
  const [recentList,      setRecentList]      = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [activeSubject,   setActiveSubject]   = useState('All');
  const [searchResults,   setSearchResults]   = useState(null);
  const [searchLoading,   setSearchLoading]   = useState(false);

  // Load initial data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [videosRes, subjectsRes, continueRes, recentRes] = await Promise.all([
          videoAPI.getAll(),
          videoAPI.getSubjects(),
          progressAPI.getContinueWatching(),
          progressAPI.getRecentlyWatched(),
        ]);
        setVideos(videosRes.data.data);
        setSubjects(subjectsRes.data.data || []);
        setContinueList(continueRes.data.data || []);
        setRecentList(recentRes.data.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await videoAPI.search(searchQuery.trim());
        setSearchResults(res.data.data);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter by subject (when not searching)
  const filteredVideos = useMemo(() => {
    const list = searchResults !== null ? searchResults : videos;
    if (activeSubject === 'All' || searchResults !== null) return list;
    return list.filter(v => v.subject === activeSubject);
  }, [videos, searchResults, activeSubject]);

  function clearSearch() {
    setSearchQuery('');
    setSearchResults(null);
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome banner */}
      <div className="dashboard__welcome">
        <div>
          <h1 className="welcome-title">
            Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="welcome-sub">Ready to learn something new today?</p>
        </div>
        <div className="welcome-stats">
          <div className="stat-chip">
            <span className="stat-num">{videos.length}</span>
            <span className="stat-label">Courses</span>
          </div>
          <div className="stat-chip">
            <span className="stat-num">{recentList.filter(r => r.completed).length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-chip">
            <span className="stat-num">{continueList.length}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="dashboard__search">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search videos by title, subject or instructor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search videos"
          />
          {searchQuery && (
            <button className="search-clear" onClick={clearSearch} aria-label="Clear search">✕</button>
          )}
        </div>
      </div>

      {/* Continue Watching */}
      {continueList.length > 0 && !searchQuery && (
        <section className="dashboard__section">
          <h2 className="section-title">▶ Continue Watching</h2>
          <div className="continue-list">
            {continueList.map(wp => (
              <ContinueCard key={wp.id} wp={wp} onClick={() => navigate(`/video/${wp.videoId}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Watched */}
      {recentList.length > 0 && !searchQuery && (
        <section className="dashboard__section">
          <h2 className="section-title">🕒 Recently Watched</h2>
          <div className="recent-list">
            {recentList.slice(0, 4).map(wp => (
              <RecentItem key={wp.id} wp={wp} onClick={() => navigate(`/video/${wp.videoId}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Subject filters */}
      {!searchQuery && (
        <div className="subject-filters" role="tablist" aria-label="Filter by subject">
          <button
            className={`subject-chip ${activeSubject === 'All' ? 'active' : ''}`}
            onClick={() => setActiveSubject('All')}
            role="tab" aria-selected={activeSubject === 'All'}
          >
            All
          </button>
          {subjects.map(s => (
            <button
              key={s}
              className={`subject-chip ${activeSubject === s ? 'active' : ''}`}
              onClick={() => setActiveSubject(s)}
              role="tab" aria-selected={activeSubject === s}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Video grid */}
      <section className="dashboard__section">
        {searchQuery && (
          <h2 className="section-title">
            {searchLoading
              ? '🔍 Searching...'
              : `Results for "${searchQuery}" (${filteredVideos.length})`}
          </h2>
        )}
        {!searchQuery && <h2 className="section-title">📚 All Courses</h2>}

        {searchLoading ? (
          <div className="dashboard-loading small"><div className="spinner" /></div>
        ) : filteredVideos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎬</span>
            <p>No videos found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
            {searchQuery && <button className="btn-text" onClick={clearSearch}>Clear search</button>}
          </div>
        ) : (
          <div className="video-grid">
            {filteredVideos.map(v => <VideoCard key={v.id} video={v} />)}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function ContinueCard({ wp, onClick }) {
  return (
    <div className="continue-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="continue-card__thumb">
        <img src={wp.videoThumbnailUrl || 'https://via.placeholder.com/160x90/4F46E5/white?text=Video'}
          alt={wp.videoTitle} />
        <div className="continue-card__overlay">▶</div>
      </div>
      <div className="continue-card__info">
        <p className="continue-card__title">{wp.videoTitle}</p>
        <p className="continue-card__time">
          {formatTime(wp.progressSeconds)}
          {wp.videoDurationSeconds ? ` / ${formatTime(wp.videoDurationSeconds)}` : ''}
        </p>
        <div className="continue-card__bar">
          <div className="continue-card__fill"
            style={{ width: `${Math.min(wp.progressPercent, 100)}%` }} />
        </div>
        <p className="continue-card__pct">{Math.round(wp.progressPercent)}% complete</p>
      </div>
    </div>
  );
}

function RecentItem({ wp, onClick }) {
  return (
    <div className="recent-item" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <img className="recent-item__thumb"
        src={wp.videoThumbnailUrl || 'https://via.placeholder.com/80x45/4F46E5/white?text=V'}
        alt={wp.videoTitle} />
      <div className="recent-item__info">
        <p className="recent-item__title">{wp.videoTitle}</p>
        <p className="recent-item__meta">
          {wp.completed ? '✅ Completed' : `${Math.round(wp.progressPercent)}% watched`}
          {' · '}{timeAgo(wp.lastWatchedAt)}
        </p>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
