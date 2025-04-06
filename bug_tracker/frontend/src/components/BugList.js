import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBugs } from '../services/api';
import './BugList.css';

const BugList = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBugs = async () => {
      try {
        const data = await fetchBugs();
        setBugs(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bugs. Please try again later.');
        setLoading(false);
      }
    };

    loadBugs();
  }, []);

  if (loading) return <div className="loading">Loading bugs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="bug-list-container">
      <h2>Bug List</h2>
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
            {bugs.map((bug) => (
              <tr key={bug.bug_id} className={`priority-${bug.priority}`}>
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

export default BugList; 