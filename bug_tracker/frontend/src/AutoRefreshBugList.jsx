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
        marginBottom: '20px',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <h2>Bug List</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={handleForceRefresh} 
            style={{
              padding: '5px 10px',
              backgroundColor: '#0056b3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Force Refresh
          </button>
          <div style={{ 
            fontSize: '0.9em', 
            color: '#333',
            backgroundColor: '#e0e0e0',
            padding: '5px 10px',
            borderRadius: '3px',
            fontWeight: 'bold'
          }}>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {bugs.length === 0 ? (
        <p>No bugs found.</p>
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