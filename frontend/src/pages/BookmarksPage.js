import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookmarkAPI } from '../services/api';
import { formatTime, timeAgo } from '../utils/time';
// Styles loaded from src/index.css

export default function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks,  setBookmarks]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search,     setSearch]     = useState('');
  const [editId,     setEditId]     = useState(null);
  const [editForm,   setEditForm]   = useState({ name: '', notes: '', timestampSeconds: 0 });
  const [saving,     setSaving]     = useState(false);

  useEffect(() => { loadBookmarks(); }, []);

  async function loadBookmarks() {
    setLoading(true);
    try {
      const res = await bookmarkAPI.getAll();
      setBookmarks(res.data.data || []);
    } catch { setBookmarks([]); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this bookmark?')) return;
    setDeletingId(id);
    try {
      await bookmarkAPI.delete(id);
      setBookmarks(bs => bs.filter(b => b.id !== id));
    } catch { alert('Failed to delete.'); }
    finally { setDeletingId(null); }
  }

  function openEdit(bm) {
    setEditId(bm.id);
    setEditForm({ name: bm.name || '', notes: bm.notes || '', timestampSeconds: bm.timestampSeconds });
  }

  async function handleEditSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await bookmarkAPI.update(editId, {
        name: editForm.name.trim() || null,
        notes: editForm.notes.trim() || null,
        timestampSeconds: Number(editForm.timestampSeconds),
        videoId: bookmarks.find(b => b.id === editId)?.videoId,
      });
      const updated = res.data.data;
      setBookmarks(bs => bs.map(b => b.id === editId ? updated : b));
      setEditId(null);
    } catch { alert('Failed to update bookmark.'); }
    finally { setSaving(false); }
  }

  // Group bookmarks by video
  const grouped = bookmarks.reduce((acc, bm) => {
    const key = bm.videoId;
    if (!acc[key]) acc[key] = { videoTitle: bm.videoTitle, videoThumbnailUrl: bm.videoThumbnailUrl, videoId: bm.videoId, items: [] };
    acc[key].items.push(bm);
    return acc;
  }, {});

  const filtered = Object.values(grouped).map(g => ({
    ...g,
    items: g.items.filter(bm =>
      !search ||
      bm.name?.toLowerCase().includes(search.toLowerCase()) ||
      bm.notes?.toLowerCase().includes(search.toLowerCase()) ||
      g.videoTitle?.toLowerCase().includes(search.toLowerCase()) ||
      formatTime(bm.timestampSeconds).includes(search)
    ),
  })).filter(g => g.items.length > 0);

  return (
    <div className="bmpage">
      {/* Header */}
      <div className="bmpage__header">
        <div>
          <h1 className="bmpage__title">🔖 My Bookmarks</h1>
          <p className="bmpage__sub">
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''} across {Object.keys(grouped).length} video{Object.keys(grouped).length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bmpage__search">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Search bookmarks by name, notes or video..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bmpage__search-input"
          aria-label="Search bookmarks"
        />
        {search && (
          <button className="bmpage__search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bmpage__loading"><div className="spinner" /><p>Loading bookmarks...</p></div>
      ) : bookmarks.length === 0 ? (
        <div className="bmpage__empty">
          <span className="empty-icon">🔖</span>
          <h2>No bookmarks yet</h2>
          <p>While watching a video, click the <strong>🔖 Bookmark</strong> button to save a moment.</p>
          <button className="bmpage__goto-btn" onClick={() => navigate('/dashboard')}>
            Browse Courses
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bmpage__empty">
          <span className="empty-icon">🔍</span>
          <p>No bookmarks match "<strong>{search}</strong>"</p>
          <button className="btn-text" onClick={() => setSearch('')}>Clear search</button>
        </div>
      ) : (
        <div className="bmpage__groups">
          {filtered.map(group => (
            <section key={group.videoId} className="bm-group">
              {/* Video header */}
              <div className="bm-group__header"
                onClick={() => navigate(`/video/${group.videoId}`)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/video/${group.videoId}`)}>
                <img
                  className="bm-group__thumb"
                  src={group.videoThumbnailUrl || `https://via.placeholder.com/80x45/4F46E5/white?text=V`}
                  alt={group.videoTitle}
                />
                <div>
                  <h2 className="bm-group__title">{group.videoTitle}</h2>
                  <p className="bm-group__count">{group.items.length} bookmark{group.items.length !== 1 ? 's' : ''}</p>
                </div>
                <span className="bm-group__arrow">→</span>
              </div>

              {/* Bookmark items */}
              <ul className="bm-group__list">
                {group.items.map(bm => (
                  <li key={bm.id} className="bm-item">
                    {editId === bm.id ? (
                      /* Edit inline form */
                      <form className="bm-edit-form" onSubmit={handleEditSave}>
                        <div className="bm-edit-row">
                          <div className="bm-edit-field">
                            <label>Timestamp (s)</label>
                            <input type="number" min="0"
                              value={editForm.timestampSeconds}
                              onChange={e => setEditForm(f => ({ ...f, timestampSeconds: e.target.value }))} />
                            <span className="bm-ts-preview">{formatTime(editForm.timestampSeconds)}</span>
                          </div>
                          <div className="bm-edit-field">
                            <label>Name</label>
                            <input type="text" placeholder="Optional name"
                              value={editForm.name}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                          </div>
                        </div>
                        <div className="bm-edit-field">
                          <label>Notes</label>
                          <textarea rows={2} placeholder="Optional notes"
                            value={editForm.notes}
                            onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                        <div className="bm-edit-actions">
                          <button type="button" className="bm-btn-cancel" onClick={() => setEditId(null)}>Cancel</button>
                          <button type="submit" className="bm-btn-save" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Normal display */
                      <>
                        <button
                          className="bm-item__ts"
                          onClick={() => navigate(`/video/${bm.videoId}?t=${Math.floor(bm.timestampSeconds)}`)}
                          title={`Open at ${formatTime(bm.timestampSeconds)}`}
                        >
                          ▶ {formatTime(bm.timestampSeconds)}
                        </button>
                        <div className="bm-item__info">
                          <p className="bm-item__name">
                            {bm.name || <span className="bm-unnamed">Unnamed bookmark</span>}
                          </p>
                          {bm.notes && <p className="bm-item__notes">{bm.notes}</p>}
                          <p className="bm-item__date">{timeAgo(bm.createdAt)}</p>
                        </div>
                        <div className="bm-item__actions">
                          <button className="bm-action-btn" onClick={() => openEdit(bm)} aria-label="Edit">✏️</button>
                          <button className="bm-action-btn danger"
                            onClick={() => handleDelete(bm.id)}
                            disabled={deletingId === bm.id}
                            aria-label="Delete">
                            {deletingId === bm.id ? '...' : '🗑️'}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
