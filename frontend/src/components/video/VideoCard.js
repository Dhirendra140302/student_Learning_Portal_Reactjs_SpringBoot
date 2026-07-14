import React from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../../utils/time";
// Styles loaded from src/index.css

// Generate a self-contained SVG thumbnail with a course-style layout
function makeSvgThumb(title) {
  const colors = [
    "4F46E5",
    "7C3AED",
    "2563EB",
    "059669",
    "DC2626",
    "D97706",
    "0891B2",
    "BE185D",
  ];
  const hash = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  const label = title.length > 22 ? title.substring(0, 22) + "..." : title;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
    <rect width="640" height="360" fill="#${color}"/>
    <rect x="58" y="62" width="524" height="236" rx="28" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
    <circle cx="212" cy="182" r="54" fill="rgba(255,255,255,0.94)"/>
    <path d="M194 148 L247 182 L194 216 Z" fill="#${color}"/>
    <rect x="92" y="112" width="220" height="12" rx="6" fill="rgba(255,255,255,0.9)"/>
    <rect x="92" y="136" width="180" height="10" rx="5" fill="rgba(255,255,255,0.7)"/>
    <rect x="92" y="154" width="140" height="10" rx="5" fill="rgba(255,255,255,0.6)"/>
    <text x="320" y="292" font-family="Arial,sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  const progressPercent = video.progressPercent || 0;
  const hasProgress = progressPercent > 0;
  const isCompleted = video.completed;
  const thumbSrc =
    video.thumbnailUrl &&
    !video.thumbnailUrl.startsWith("https://via.placeholder")
      ? video.thumbnailUrl
      : makeSvgThumb(video.title);

  function handleClick() {
    navigate(`/video/${video.id}`);
  }

  return (
    <article
      className="video-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={`Watch ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="video-card__thumb">
        <img
          src={thumbSrc}
          alt={video.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = makeSvgThumb(video.title);
          }}
        />

        {/* Duration badge */}
        {video.durationSeconds && (
          <span className="video-card__duration">
            {formatTime(video.durationSeconds)}
          </span>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <span className="video-card__badge completed">✓ Done</span>
        )}

        {/* Play overlay */}
        <div className="video-card__play-overlay">
          <div className="play-circle">▶</div>
        </div>

        {/* Progress bar */}
        {hasProgress && !isCompleted && (
          <div className="video-card__progress-bar">
            <div
              className="video-card__progress-fill"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="video-card__info">
        <div className="video-card__meta">
          {video.subject && (
            <span className="video-card__subject">{video.subject}</span>
          )}
          {video.bookmarkCount > 0 && (
            <span className="video-card__bookmarks">
              📚 {video.bookmarkCount}
            </span>
          )}
        </div>

        <h3 className="video-card__title">{video.title}</h3>

        {video.instructor && (
          <p className="video-card__instructor">👨‍🏫 {video.instructor}</p>
        )}

        {hasProgress && !isCompleted && (
          <p className="video-card__resume">
            ▶ Resume from {formatTime(video.progressSeconds)}
            <span className="progress-pct">{Math.round(progressPercent)}%</span>
          </p>
        )}
      </div>
    </article>
  );
}
