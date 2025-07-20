import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import MessagesPage from './MessagesPage';

const INSTAGRAM_AUTH_URL =
  `https://www.instagram.com/oauth/authorize?client_id=${process.env.REACT_APP_INSTAGRAM_CLIENT_ID}&redirect_uri=https://my.m.redirect.net/&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish`;

function Home() {
  const handleLogin = () => {
    window.location.href = INSTAGRAM_AUTH_URL;
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
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
