import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// Styles loaded from src/index.css

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path ? "active" : "";
  }

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <Link to="/dashboard" className="navbar__brand">
          <span className="navbar__logo">🎓</span>
          <span className="navbar__brand-text">
            <span className="brand-gvcc">GVCC</span>
            <span className="brand-portal">Learning Portal</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar__links">
          <Link
            to="/dashboard"
            className={`navbar__link ${isActive("/dashboard")}`}
          >
            🏠 Dashboard
          </Link>
          <Link
            to="/bookmarks"
            className={`navbar__link ${isActive("/bookmarks")}`}
          >
            🔖 My Bookmarks
          </Link>
        </div>

        {/* User menu */}
        <div
          className="navbar__user"
          onClick={() => setUserMenuOpen((o) => !o)}
        >
          <div className="navbar__avatar">
            {user?.fullName?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="navbar__user-name">{user?.fullName}</span>
          <span className="navbar__chevron">{userMenuOpen ? "▲" : "▼"}</span>

          {userMenuOpen && (
            <div className="navbar__dropdown">
              <div className="navbar__dropdown-header">
                <p className="dropdown-name">{user?.fullName}</p>
                <p className="dropdown-email">{user?.email}</p>
                <span className="dropdown-badge">{user?.role}</span>
              </div>
              <hr />
              <Link
                to="/bookmarks"
                className="navbar__dropdown-item"
                onClick={() => setUserMenuOpen(false)}
              >
                🔖 My Bookmarks
              </Link>
              <button
                className="navbar__dropdown-item logout"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="navbar__mobile-menu">
          <Link
            to="/dashboard"
            className="mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            🏠 Dashboard
          </Link>
          <Link
            to="/bookmarks"
            className="mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            🔖 Bookmarks
          </Link>
          <button
            className="mobile-link logout"
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
}
