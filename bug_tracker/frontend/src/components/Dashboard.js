import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, Sector
} from 'recharts';
import { fetchBugModifications } from '../services/api';
import './Dashboard.css';

// Color palette for the dashboard
const COLORS = ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'];
const ACTIVITY_COLORS = {
  high: '#388E3C',   // dark green for high activity
  medium: '#66BB6A', // medium green
  low: '#A5D6A7'     // light green for low activity
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-date">{label}</p>
        <p className="tooltip-count">
          <span className="tooltip-label">Modifications:</span>
          <span className="tooltip-value">{payload[0].value}</span>
        </p>
        <div className="tooltip-indicator">
          {payload[0].value > 5 ? 'High Activity' : payload[0].value > 2 ? 'Medium Activity' : 'Low Activity'}
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  
  // For the activity pie chart
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadModifications = async () => {
      try {
        const data = await fetchBugModifications();
        
        // Add activity level to each data point
        const enhancedData = data.map(item => ({
          ...item,
          activityLevel: item.count > 5 ? 'high' : item.count > 2 ? 'medium' : 'low'
        }));
        
        setModifications(enhancedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bug modification data. Please try again later.');
        setLoading(false);
      }
    };

    loadModifications();
  }, []);
  
  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (dateRange === 'all') return modifications;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch(dateRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return modifications;
    }
    
    return modifications.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  }, [modifications, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredData.length) return { total: 0, days: 0, avg: 0, max: 0 };
    
    const total = filteredData.reduce((sum, item) => sum + item.count, 0);
    const max = Math.max(...filteredData.map(item => item.count));
    
    return {
      total,
      days: filteredData.length,
      avg: (total / filteredData.length).toFixed(2),
      max
    };
  }, [filteredData]);
  
  // For pie chart data
  const activityData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    filteredData.forEach(item => {
      counts[item.activityLevel]++;
    });
    
    return [
      { name: 'High Activity Days', value: counts.high, color: ACTIVITY_COLORS.high },
      { name: 'Medium Activity Days', value: counts.medium, color: ACTIVITY_COLORS.medium },
      { name: 'Low Activity Days', value: counts.low, color: ACTIVITY_COLORS.low }
    ].filter(item => item.value > 0);
  }, [filteredData]);
  
  // Animation handler for pie chart
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  // Custom active shape for pie chart
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} days`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  if (loading) return <div className="loading">Loading dashboard data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Bug Modifications Over Time</h2>
        <div className="dashboard-controls">          
          <div className="control-group">
            <label>Time Period:</label>
            <div className="button-group">
              <button 
                className={`control-button ${dateRange === 'week' ? 'active' : ''}`}
                onClick={() => setDateRange('week')}
              >
                Week
              </button>
              <button 
                className={`control-button ${dateRange === 'month' ? 'active' : ''}`}
                onClick={() => setDateRange('month')}
              >
                Month
              </button>
              <button 
                className={`control-button ${dateRange === 'quarter' ? 'active' : ''}`}
                onClick={() => setDateRange('quarter')}
              >
                Quarter
              </button>
              <button 
                className={`control-button ${dateRange === 'all' ? 'active' : ''}`}
                onClick={() => setDateRange('all')}
              >
                All Time
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {filteredData.length === 0 ? (
        <div className="no-data">No modification data available for the selected period.</div>
      ) : (
        <div className="dashboard-content">
          <div className="chart-container main-chart">
            <h3>Bug Modification Activity</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#666', fontSize: 12 }}
                  tickLine={{ stroke: '#ccc' }}
                />
                <YAxis 
                  tick={{ fill: '#666', fontSize: 12 }}
                  tickLine={{ stroke: '#ccc' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Bug Modifications"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  activeDot={{ r: 8, fill: '#388E3C' }}
                  dot={{ stroke: '#4CAF50', strokeWidth: 2, r: 4, fill: 'white' }}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="dashboard-cards">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Modifications</h3>
                <p className="summary-value">{stats.total}</p>
              </div>
              
              <div className="summary-card">
                <h3>Days with Activity</h3>
                <p className="summary-value">{stats.days}</p>
              </div>
              
              <div className="summary-card">
                <h3>Average Per Day</h3>
                <p className="summary-value">{stats.avg}</p>
              </div>
              
              <div className="summary-card">
                <h3>Most Active Day</h3>
                <p className="summary-value">{stats.max}</p>
              </div>
            </div>
            
            {activityData.length > 0 && (
              <div className="activity-distribution">
                <h3>Activity Distribution</h3>
                <div className="pie-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={activityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="activity-legend">
                  {activityData.map((entry, index) => (
                    <div key={`legend-${index}`} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: entry.color }}></div>
                      <div className="legend-label">{entry.name}</div>
                      <div className="legend-value">{entry.value} days</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 