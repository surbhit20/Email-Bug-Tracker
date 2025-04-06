import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchBugModifications } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModifications = async () => {
      try {
        const data = await fetchBugModifications();
        setModifications(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bug modification data. Please try again later.');
        setLoading(false);
      }
    };

    loadModifications();
  }, []);

  if (loading) return <div className="loading">Loading dashboard data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2>Bug Modifications Over Time</h2>
      
      {modifications.length === 0 ? (
        <p className="no-data">No modification data available.</p>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={modifications}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Bug Modifications"
                stroke="#3498db"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Modifications</h3>
          <p className="summary-value">
            {modifications.reduce((total, item) => total + item.count, 0)}
          </p>
        </div>
        
        <div className="summary-card">
          <h3>Days with Activity</h3>
          <p className="summary-value">{modifications.length}</p>
        </div>
        
        <div className="summary-card">
          <h3>Average Modifications</h3>
          <p className="summary-value">
            {modifications.length > 0
              ? (modifications.reduce((total, item) => total + item.count, 0) / modifications.length).toFixed(2)
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 