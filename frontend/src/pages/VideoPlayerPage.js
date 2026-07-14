import React, { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { videoAPI, bookmarkAPI, progressAPI } from "../services/api";
import BookmarkPanel from "../components/bookmark/BookmarkPanel";
import { formatTime } from "../utils/time";
// Styles loaded from src/index.css

const PROGRESS_SAVE_INTERVAL = 10000;

export default function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressTimer = useRef(null);

  const [video, setVideo] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showBmBtn, setShowBmBtn] = useState(false);
  const [bmAdded, setBmAdded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);

  // ── Load page data ────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      setVideoError("");
      try {
        const [vRes, bRes, pRes] = await Promise.all([
          videoAPI.getById(id),
          bookmarkAPI.getForVideo(id),
          progressAPI.getForVideo(id),
        ]);
        setVideo(vRes.data.data);
        setBookmarks(bRes.data.data || []);

        const tParam = searchParams.get("t");
        const savedPrg = pRes.data.data;
        const seekTo = tParam
          ? Number(tParam)
          : savedPrg?.progressSeconds > 5 && !savedPrg?.completed
            ? savedPrg.progressSeconds
            : null;

        if (seekTo) {
          const el = videoRef.current;
          if (el) {
            el.addEventListener(
              "loadedmetadata",
              () => {
                el.currentTime = seekTo;
              },
              { once: true },
            );
          }
        }
      } catch (err) {
        setPageError("Failed to load video. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();

    // Screenshot protection
    function onVisibilityChange() {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
    function onKeyDown(e) {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        navigator.clipboard?.writeText("");
        const n = document.getElementById("screenshot-notice");
        if (n) {
          n.style.opacity = "1";
          setTimeout(() => {
            n.style.opacity = "0";
          }, 2500);
        }
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("keydown", onKeyDown);
      clearInterval(progressTimer.current);
    };
  }, [id, searchParams]);

  // ── Progress saving ───────────────────────────────────────
  const saveProgress = useCallback(
    async (time, dur) => {
      if (!dur || !id) return;
      const pct = Math.min((time / dur) * 100, 100);
      try {
        await progressAPI.save({
          videoId: Number(id),
          progressSeconds: time,
          progressPercent: pct,
        });
      } catch {
        /* silent */
      }
    },
    [id],
  );

  useEffect(() => {
    if (!duration) return;
    progressTimer.current = setInterval(() => {
      if (videoRef.current && isPlaying)
        saveProgress(videoRef.current.currentTime, duration);
    }, PROGRESS_SAVE_INTERVAL);
    return () => clearInterval(progressTimer.current);
  }, [duration, isPlaying, saveProgress]);

  useEffect(() => {
    const el = videoRef.current;
    return () => {
      if (el && duration) saveProgress(el.currentTime, duration);
    };
  }, [duration, saveProgress]);

  // ── Video event handlers ──────────────────────────────────
  function onTimeUpdate() {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setShowBmBtn(true);
    setVideoError("");
  }

  function onLoadedMetadata() {
    setDuration(videoRef.current?.duration || 0);
    setVideoLoading(false);
    setVideoError("");
  }

  function onCanPlay() {
    setVideoLoading(false);
    setVideoError("");
  }

  function onVideoError(e) {
    setVideoLoading(false);
    const err = e.target.error;
    let msg = "";
    if (!err) {
      msg =
        "Video could not be loaded. The source may be unavailable on this network.";
    } else {
      switch (err.code) {
        case 1:
          msg = "Video loading was aborted.";
          break;
        case 2:
          msg =
            "Network error while loading video. Check your internet connection.";
          break;
        case 3:
          msg = "Video format is not supported by your browser.";
          break;
        case 4:
          msg =
            "Video source is unavailable or blocked. This may be a network restriction.";
          break;
        default:
          msg = `Video error (code ${err.code}). The source may be blocked on this network.`;
      }
    }
    setVideoError(msg);
    console.warn("Video error:", err);
  }

  function onPlay() {
    setIsPlaying(true);
    setIsInteractive(true);
    setVideoError("");
  }
  function onPause() {
    setIsPlaying(false);
    setIsInteractive(false);
    saveProgress(videoRef.current?.currentTime, duration);
  }
  function onEnded() {
    setIsPlaying(false);
    setIsInteractive(false);
    saveProgress(duration, duration);
  }
  function onWaiting() {
    setVideoLoading(true);
  }
  function onPlaying() {
    setVideoLoading(false);
  }

  // ── Controls ──────────────────────────────────────────────
  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }

  function seekTo(seconds) {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.max(0, Math.min(seconds, duration));
    if (v.paused) v.play().catch(() => {});
  }

  function onProgressBarClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo(((e.clientX - rect.left) / rect.width) * duration);
  }

  function onVolumeChange(e) {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setIsMuted(val === 0);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    const mute = !isMuted;
    setIsMuted(mute);
    v.muted = mute;
  }

  function skip(secs) {
    seekTo(currentTime + secs);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement)
      containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  // ── Bookmarks ─────────────────────────────────────────────
  async function quickBookmark() {
    try {
      await bookmarkAPI.create({
        timestampSeconds: Math.floor(currentTime),
        videoId: Number(id),
      });
      await refreshBookmarks();
      setBmAdded(true);
      setTimeout(() => setBmAdded(false), 2000);
    } catch {
      /* silent */
    }
  }

  async function refreshBookmarks() {
    const res = await bookmarkAPI.getForVideo(id);
    setBookmarks(res.data.data || []);
  }

  // ── Render ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="vp-loading">
        <div className="spinner" />
        <p>Loading video...</p>
      </div>
    );
  }

  if (pageError || !video) {
    return (
      <div className="vp-error">
        <span role="img" aria-label="error">
          ⚠️
        </span>
        <p>{pageError || "Video not found."}</p>
        <button onClick={() => navigate("/dashboard")} className="vp-back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="vp-page">
      <button className="vp-back" onClick={() => navigate("/dashboard")}>
        ← Back to Courses
      </button>

      <div className="vp-layout">
        {/* ── Left: Player ── */}
        <div className="vp-main">
          <h1 className="vp-title">{video.title}</h1>
          <div className="vp-meta">
            {video.subject && <span className="vp-tag">{video.subject}</span>}
            {video.instructor && (
              <span className="vp-instructor">👨‍🏫 {video.instructor}</span>
            )}
            {video.durationSeconds && (
              <span className="vp-dur">
                ⏱ {formatTime(video.durationSeconds)}
              </span>
            )}
          </div>

          {/* Screenshot-protected player container */}
          <div
            ref={containerRef}
            className={`vp-container screenshot-protected${isInteractive ? " is-active" : ""}`}
            data-watermark="GVCC Learning Portal"
            onMouseMove={() => setIsInteractive(true)}
            onMouseLeave={() => setIsInteractive(false)}
            onTouchStart={() => setIsInteractive(true)}
          >
            <div id="screenshot-notice" className="screenshot-notice">
              🔒 Screenshots are not permitted for this content.
            </div>

            {/* Video loading spinner overlay */}
            {videoLoading && !videoError && (
              <div className="vp-video-loading">
                <div className="spinner" />
              </div>
            )}

            {/* Video error overlay */}
            {videoError && (
              <div className="vp-video-error">
                <span>⚠️</span>
                <p>{videoError}</p>
                <p className="vp-video-error-hint">
                  You can still use all bookmark features. The video may be
                  accessible on a different network.
                </p>
                <button
                  onClick={() => {
                    setVideoError("");
                    setVideoLoading(true);
                    if (videoRef.current) {
                      videoRef.current.load();
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className="vp-retry-btn"
                >
                  ↩ Retry
                </button>
              </div>
            )}

            <video
              ref={videoRef}
              className="vp-video"
              src={video.videoUrl}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              onCanPlay={onCanPlay}
              onPlay={onPlay}
              onPause={onPause}
              onEnded={onEnded}
              onError={onVideoError}
              onWaiting={onWaiting}
              onPlaying={onPlaying}
              onContextMenu={(e) => e.preventDefault()}
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              playsInline
            />

            {/* Custom controls — always visible so bookmarks remain usable */}
            <div className="vp-controls">
              {/* Progress bar */}
              <div
                className="vp-progress-wrap"
                onClick={onProgressBarClick}
                role="slider"
                aria-label="Video progress"
                aria-valuenow={Math.round(progressPct)}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
              >
                <div className="vp-progress-bg">
                  <div
                    className="vp-progress-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                  {bookmarks.map(
                    (bm) =>
                      duration > 0 && (
                        <div
                          key={bm.id}
                          className="vp-bm-marker"
                          style={{
                            left: `${(bm.timestampSeconds / duration) * 100}%`,
                          }}
                          title={bm.name || formatTime(bm.timestampSeconds)}
                          onClick={(e) => {
                            e.stopPropagation();
                            seekTo(bm.timestampSeconds);
                          }}
                        />
                      ),
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="vp-btn-row">
                <div className="vp-left-btns">
                  <button
                    className="vp-ctrl-btn"
                    onClick={() => skip(-10)}
                    title="Back 10s"
                  >
                    ⏪ 10s
                  </button>
                  <button
                    className="vp-ctrl-btn play-pause"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <button
                    className="vp-ctrl-btn"
                    onClick={() => skip(10)}
                    title="Forward 10s"
                  >
                    10s ⏩
                  </button>
                  <button
                    className="vp-ctrl-btn"
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0
                      ? "🔇"
                      : volume < 0.5
                        ? "🔕"
                        : "🔊"}
                  </button>
                  <input
                    className="vp-volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={onVolumeChange}
                    aria-label="Volume"
                  />
                  <span className="vp-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="vp-right-btns">
                  {showBmBtn && (
                    <button
                      className={`vp-ctrl-btn bookmark-btn${bmAdded ? " added" : ""}`}
                      onClick={quickBookmark}
                      title="Bookmark current time"
                    >
                      {bmAdded ? "✓ Bookmarked" : "📌 Bookmark"}
                    </button>
                  )}
                  <button
                    className="vp-ctrl-btn mobile-panel-toggle"
                    onClick={() => setPanelOpen((o) => !o)}
                    title="Toggle bookmarks panel"
                  >
                    📋
                  </button>
                  <button
                    className="vp-ctrl-btn"
                    onClick={toggleFullscreen}
                    title="Fullscreen"
                  >
                    ⛶
                  </button>
                </div>
              </div>
            </div>
          </div>

          {video.description && (
            <div className="vp-description">
              <h3>About this video</h3>
              <p>{video.description}</p>
            </div>
          )}
        </div>

        {/* ── Right: Bookmark panel ── */}
        {panelOpen && (
          <aside className="vp-sidebar">
            <BookmarkPanel
              videoId={Number(id)}
              bookmarks={bookmarks}
              onBookmarksChange={refreshBookmarks}
              onSeek={seekTo}
              currentTime={currentTime}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
