import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BugDetail from './components/BugDetail';
import Dashboard from './components/Dashboard';
import AutoRefreshBugList from './AutoRefreshBugList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/bugs" replace />} />
            <Route path="/bugs" element={<AutoRefreshBugList />} />
            <Route path="/bugs/:bugId" element={<BugDetail />} />
            <Route path="/bug_modifications" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;