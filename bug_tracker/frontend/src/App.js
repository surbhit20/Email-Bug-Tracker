import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
            <Route path="/" element={<AutoRefreshBugList />} />
            <Route path="/bugs/:bugId" element={<BugDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;