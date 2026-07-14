import React, { useState } from 'react';
import { bookmarkAPI } from '../../services/api';
import { formatTime, timeAgo } from '../../utils/time';
// Styles loaded from src/index.css

export default function BookmarkPanel({ videoId, bookmarks, onBookmarksChange, onSeek, currentTime = 0 }) {
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState({ name: '', notes: '', timestampSeconds: 0 });
  const [saving,    setSaving]    = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error,     setError]     = useState('');

  function openCreateForm(currentTime) {
    setEditId(null);
    setForm({ name: '', notes: '', timestampSeconds: Math.floor(currentTime || 0) });
    setShowForm(true);
    setError('');
  }

  function openEditForm(bm) {
    setEditId(bm.id);
    setForm({ name: bm.name || '', notes: bm.notes || '', timestampSeconds: bm.timestampSeconds });
    setShowForm(true);
    setError('');
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim() || null,
        notes: form.notes.trim() || null,
        timestampSeconds: Number(form.timestampSeconds),
        videoId,
      };
      if (editId) {
        await bookmarkAPI.update(editId, payload);
      } else {
        await bookmarkAPI.create(payload);
      }
      await onBookmarksChange();
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bookmark.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this bookmark?')) return;
    setDeletingId(id);
    try {
      await bookmarkAPI.delete(id);
      await onBookmarksChange();
    } catch { alert('Failed to delete bookmark.'); }
    finally { setDeletingId(null); }
  }

  return (
    <div className="bookmark-panel">
      {/* Header */}
      <div className="bp__header">
        <h3 className="bp__title">🔖 Bookmarks ({bookmarks.length})</h3>
        <button className="bp__add-btn" onClick={() => openCreateForm(currentTime)}
          aria-label="Add bookmark">
          + Add
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <form className="bp__form" onSubmit={handleSave}>
          <p className="bp__form-title">{editId ? 'Edit Bookmark' : 'New Bookmark'}</p>
          {error && <p className="bp__error">{error}</p>}

          <div className="bp__form-group">
            <label>Timestamp (seconds)</label>
            <input
              type="number" min="0" step="1"
              value={form.timestampSeconds}
              onChange={e => setForm(f => ({ ...f, timestampSeconds: e.target.value }))}
              required
            />
            <span className="bp__ts-preview">{formatTime(form.timestampSeconds)}</span>
          </div>

          <div className="bp__form-group">
            <label>Name <span className="optional">(optional)</span></label>
            <input
              type="text" placeholder="e.g. Key concept explained"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              maxLength={80}
            />
          </div>

          <div className="bp__form-group">
            <label>Notes <span className="optional">(optional)</span></label>
            <textarea
              placeholder="Any notes about this moment..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              maxLength={300}
            />
          </div>

          <div className="bp__form-actions">
            <button type="button" className="bp__btn-cancel" onClick={closeForm}>Cancel</button>
            <button type="submit" className="bp__btn-save" disabled={saving}>
              {saving ? '...' : (editId ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      )}

      {/* Bookmark list */}
      {bookmarks.length === 0 && !showForm ? (
        <div className="bp__empty">
          <span>📌</span>
          <p>No bookmarks yet.</p>
          <button className="bp__empty-btn" onClick={() => openCreateForm(0)}>
            Add your first bookmark
          </button>
        </div>
      ) : (
        <ul className="bp__list">
          {bookmarks.map(bm => (
            <li key={bm.id} className="bp__item">
              {/* Jump-to button */}
              <button
                className="bp__timestamp"
                onClick={() => onSeek(bm.timestampSeconds)}
                title={`Jump to ${formatTime(bm.timestampSeconds)}`}
                aria-label={`Jump to ${formatTime(bm.timestampSeconds)}`}
              >
                ▶ {formatTime(bm.timestampSeconds)}
              </button>

              {/* Bookmark details */}
              <div className="bp__item-info">
                <p className="bp__item-name">
                  {bm.name || <span className="bp__unnamed">Unnamed bookmark</span>}
                </p>
                {bm.notes && <p className="bp__item-notes">{bm.notes}</p>}
                <p className="bp__item-date">{timeAgo(bm.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="bp__item-actions">
                <button className="bp__action-btn edit"
                  onClick={() => openEditForm(bm)} aria-label="Edit bookmark">✏️</button>
                <button className="bp__action-btn delete"
                  onClick={() => handleDelete(bm.id)}
                  disabled={deletingId === bm.id}
                  aria-label="Delete bookmark">
                  {deletingId === bm.id ? '...' : '🗑️'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
