import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchBugs } from './services/api';
import './components/BugList.css';

// Refresh every 2 seconds for better testing
const REFRESH_INTERVAL = 2000;

const AutoRefreshBugList = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshCount, setRefreshCount] = useState(0);

  // Function to load bugs from the API
  const loadBugs = useCallback(async (forceRefresh = false) => {
    try {
      console.log(`Fetching bugs... (${forceRefresh ? 'forced refresh' : 'regular refresh'})`);
      
      // Clear any caches that might be causing issues
      if (forceRefresh) {
        console.log('Forcing a refresh and clearing caches');
        // Increment refresh count to force re-render
        setRefreshCount(prev => prev + 1);
      }
      
      const data = await fetchBugs();
      console.log('Received data:', data);
      setBugs(data);
      setLoading(false);
      setLastRefresh(new Date());
      console.log('Bugs fetched successfully:', data.length);
    } catch (err) {
      console.error('Error fetching bugs:', err);
      setError('Failed to load bugs. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Force a refresh when the user clicks the button
  const handleForceRefresh = () => {
    setLoading(true);
    loadBugs(true);
  };

  // Set up auto-refresh
  useEffect(() => {
    // Load bugs immediately on mount
    loadBugs();
    
    // Set up interval for auto-refresh
    const intervalId = setInterval(() => {
      loadBugs();
    }, REFRESH_INTERVAL);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [loadBugs]); // Add loadBugs to dependency array

  // Sort bugs - open bugs first, then closed bugs
  const sortedBugs = [...bugs].sort((a, b) => {
    // Always move closed bugs to the bottom
    if (a.status === 'closed' && b.status !== 'closed') return 1;
    if (a.status !== 'closed' && b.status === 'closed') return -1;
    
    // For secondary sorting, sort by priority (high to low)
    if (a.status === b.status) {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    }
    
    return 0;
  });

  if (loading && bugs.length === 0) return <div className="loading">Loading bugs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="bug-list-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px 25px',
        borderRadius: '12px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease'
      }}>
        <h2 style={{ 
          fontSize: '1.6rem', 
          color: '#2c3e50', 
          fontWeight: '600', 
          margin: 0 
        }}>Bug List</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={handleForceRefresh} 
            style={{
              padding: '10px 18px',
              backgroundColor: '#388E3C',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(56, 142, 60, 0.3)',
              transition: 'all 0.3s ease',
              fontWeight: '500',
              letterSpacing: '0.3px'
            }}
          >
            Force Refresh
          </button>
          <div style={{ 
            fontSize: '0.9em', 
            color: '#555',
            backgroundColor: '#f5f8f5',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: '500',
            border: '1px solid #e9f0ea'
          }}>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {bugs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '50px 20px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          fontSize: '1.1rem',
          color: '#7f8c8d'
        }}>
          No bugs found.
        </div>
      ) : (
        <table className="bug-table">
          <thead>
            <tr>
              <th>Bug ID</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBugs.map((bug) => (
              <tr 
                key={`${bug.bug_id}-${refreshCount}`} 
                className={`priority-${bug.priority} ${bug.status === 'closed' ? 'row-closed' : ''}`}
              >
                <td>{bug.bug_id}</td>
                <td>{bug.subject}</td>
                <td>
                  <span className={`status-badge status-${bug.status}`}>
                    {bug.status}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge priority-${bug.priority}`}>
                    {bug.priority}
                  </span>
                </td>
                <td>
                  <Link to={`/bugs/${bug.bug_id}`} className="view-button">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AutoRefreshBugList;