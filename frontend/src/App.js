import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import MessagesPage from './MessagesPage';
import InstagramAuthRedirect from './InstagramAuthRedirect';

const BACKEND_DOMAIN = process.env.REACT_APP_BACKEND_DOMAIN;

function Home() {
  const handleLogin = async () => {
    try {
      const response = await fetch(`${BACKEND_DOMAIN}/instagram_auth`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('No URL returned from backend');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h1>Welcome to Message Combiner</h1>
      <button onClick={handleLogin} style={{ padding: '12px 24px', fontSize: '18px', background: '#405DE6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        Login with Instagram
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ig-auth-redirect" element={<InstagramAuthRedirect />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
