import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchBugDetail, updateBugStatus } from '../services/api';
import './BugDetail.css';

const BugDetail = () => {
  const { bugId } = useParams();
  const navigate = useNavigate();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadBugDetail = async () => {
      try {
        const data = await fetchBugDetail(bugId);
        setBug(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bug details. Please try again later.');
        setLoading(false);
      }
    };

    loadBugDetail();
  }, [bugId]);

  const handleMarkAsResolved = async () => {
    if (updating) return;
    
    setUpdating(true);
    try {
      const updatedBug = await updateBugStatus(bugId, 'closed');
      setBug(updatedBug);
    } catch (err) {
      setError('Failed to update bug status. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading">Loading bug details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!bug) return <div className="error">Bug not found</div>;

  return (
    <div className="bug-detail-container">
      <div className="bug-detail-header">
        <h2>{bug.subject}</h2>
        <div className="bug-detail-meta">
          <span className={`bug-detail-status status-${bug.status}`}>
            {bug.status}
          </span>
          <span className={`bug-detail-priority priority-${bug.priority}`}>
            {bug.priority}
          </span>
        </div>
      </div>

      <div className="bug-detail-info">
        <div className="bug-detail-row">
          <div className="bug-detail-label">Bug ID:</div>
          <div className="bug-detail-value">{bug.bug_id}</div>
        </div>
        <div className="bug-detail-row">
          <div className="bug-detail-label">Created:</div>
          <div className="bug-detail-value">
            {new Date(bug.created_at).toLocaleString()}
          </div>
        </div>
        <div className="bug-detail-row">
          <div className="bug-detail-label">Last Updated:</div>
          <div className="bug-detail-value">
            {new Date(bug.updated_at).toLocaleString()}
          </div>
        </div>
        <div className="bug-detail-row">
          <div className="bug-detail-label">Modifications:</div>
          <div className="bug-detail-value">{bug.modified_count}</div>
        </div>
      </div>

      <div className="bug-detail-description">
        <h3>Description</h3>
        <div className="bug-detail-description-content">
          {bug.description}
        </div>
      </div>
      
      <div className="bug-detail-actions">
        <Link to="/" className="bug-detail-back-button">
          ← Back to Bug List
        </Link>
        
        {bug.status === 'open' && (
          <button 
            className="bug-detail-resolve-button"
            onClick={handleMarkAsResolved}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Mark as Resolved'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BugDetail; 