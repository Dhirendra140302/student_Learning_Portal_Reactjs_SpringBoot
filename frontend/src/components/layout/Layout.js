import React from 'react';
import Navbar from './Navbar';
// Styles loaded from src/index.css

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">
        {children}
      </main>
    </div>
  );
}
