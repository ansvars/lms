import React, { useState, useEffect, useCallback } from 'react';
import './HomePage.css';
import { socket } from '../services/socket';


const HomePage = () => {
  const [activeTab, setActiveTab] = useState("Today");
  const [timeline, setTimeline] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      activeUsers: 0,
      activeCourses: 10,
      completions: 0,
      inProgress: 0,
      assignedCourses: 0,
      trainingTime: "0:0"
    },
    timePeriods: {
      today: {
        logins: { count: 0, change: "+0%", trend: "neutral" },
        activeUsers: { count: 0, change: "+0%", trend: "neutral" },
        completions: { count: 0, change: "0%", trend: "neutral" }
      },
      yesterday: {
        logins: { count: 0, change: "-0%", trend: "neutral" },
        activeUsers: { count: 0, change: "-0%", trend: "neutral" },
        completions: { count: 0, change: "0%", trend: "neutral" }
      },
      week: {
        logins: { count: 0, change: "-0%", trend: "neutral" },
        activeUsers: { count: 0, change: "-0%", trend: "neutral" },
        completions: { count: 0, change: "-0%", trend: "neutral" }
      },
      month: {
        logins: { count: 0, change: "+0%", trend: "neutral" },
        activeUsers: { count: 0, change: "+0%", trend: "neutral" },
        completions: { count: 0, change: "+0%", trend: "neutral" }
      }
    }
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Memoized functions to prevent unnecessary recreations
  const updateUserCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/users/count');
      const count = await res.json();
      setDashboardData(prev => ({
        ...prev,
        overview: {
          ...prev.overview,
          activeUsers: count
        }
      }));
    } catch (error) {
      console.error('Error updating user counts:', error);
    }
  }, []);

  const updateLoginStats = useCallback(async () => {
    try {
      const res = await fetch('/api/activity/logins');
      const stats = await res.json();
      setDashboardData(prev => ({
        ...prev,
        timePeriods: {
          ...prev.timePeriods,
          today: {
            ...prev.timePeriods.today,
            logins: {
              count: stats.today,
              change: calculateChange(stats.today, prev.timePeriods.today.logins.count),
              trend: stats.today > prev.timePeriods.today.logins.count ? "up" : 
                    stats.today < prev.timePeriods.today.logins.count ? "down" : "neutral"
            }
          }
        }
      }));
    } catch (error) {
      console.error('Error updating login stats:', error);
    }
  }, []);

  const addActivity = useCallback((newEvent) => {
    setTimeline(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
  }, []);

  // Fetch initial data and set up socket listeners
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [activityRes, dashboardRes] = await Promise.all([
          fetch('/api/activity'),
          fetch('/api/dashboard')
        ]);
        
        const activityData = await activityRes.json();
        const dashboardData = await dashboardRes.json();
        
        setTimeline(activityData.map(item => ({
          type: item.type,
          user: item.user_name,
          action: item.action,
          time: new Date(item.created_at).toLocaleString()
        })));
        
        setDashboardData(dashboardData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    // Socket connection status handlers
    socket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      setConnectionStatus('error');
      console.error('Socket connection error:', err);
    });

    // Activity event handlers
    const handleUserCreated = (user) => {
      addActivity({
        type: "ADD",
        user: `${user.firstName} ${user.lastName}`,
        action: "was added to the system",
        time: new Date().toLocaleString()
      });
      updateUserCounts();
    };

    const handleUserDeleted = (user) => {
      addActivity({
        type: "DELETE",
        user: `${user.firstName} ${user.lastName}`,
        action: "was deleted from the system",
        time: new Date().toLocaleString()
      });
      updateUserCounts();
    };

    const handleUserUpdated = (user) => {
      addActivity({
        type: "UPDATE",
        user: `${user.firstName} ${user.lastName}`,
        action: "profile was updated",
        time: new Date().toLocaleString()
      });
    };

    const handleUserLogin = (user) => {
      addActivity({
        type: "LOGIN",
        user: `${user.firstName} ${user.lastName}`,
        action: "logged in to the system",
        time: new Date().toLocaleString()
      });
      updateLoginStats();
    };

    socket.on('user_created', handleUserCreated);
    socket.on('user_deleted', handleUserDeleted);
    socket.on('user_updated', handleUserUpdated);
    socket.on('user_login', handleUserLogin);

    return () => {
      socket.off('user_created', handleUserCreated);
      socket.off('user_deleted', handleUserDeleted);
      socket.off('user_updated', handleUserUpdated);
      socket.off('user_login', handleUserLogin);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [addActivity, updateUserCounts, updateLoginStats]);

  const calculateChange = (current, previous) => {
    if (previous === 0) return current === 0 ? "0%" : "+100%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
  };

  const renderTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <span className="trend-icon trend-up">↑</span>;
      case 'down': return <span className="trend-icon trend-down">↓</span>;
      default: return <span className="trend-icon trend-neutral">→</span>;
    }
  };

  const renderConnectionStatus = () => {
    switch(connectionStatus) {
      case 'connected': return <div className="connection-status connected">● Live</div>;
      case 'disconnected': return <div className="connection-status disconnected">● Offline</div>;
      case 'error': return <div className="connection-status error">● Connection Error</div>;
      default: return <div className="connection-status connecting">● Connecting...</div>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header with Connection Status */}
      <div className="dashboard-header">
        <h1>Convin Certification Dashboard</h1>
        {renderConnectionStatus()}
      </div>

      {/* Overview Cards */}
      <div className="overview-section">
        {Object.entries(dashboardData.overview).map(([key, value]) => (
          <div className={`overview-card card-${key.replace(/\s+/g, '-').toLowerCase()}`} key={key}>
            <div className="card-icon"></div>
            <div className="card-content">
              <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}</h3>
              <p>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time Period Metrics */}
      <div className="metrics-section">
        <div className="time-tabs">
          {["Today", "Yesterday", "Week", "Month"].map((tab) => (
            <button
              key={tab}
              className={`time-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="metrics-grid">
          {Object.entries(dashboardData.timePeriods[activeTab.toLowerCase()]).map(([metric, details]) => (
            <div className="metric-card" key={metric}>
              <h4>{metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
              <div className="metric-value">
                {details.count}
                <span className={`trend-indicator ${details.trend}`}>
                  {details.change} {renderTrendIcon(details.trend)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="timeline-section">
        <div className="timeline-header">
          <h2>Recent Activity</h2>
          <button 
            className="refresh-btn"
            onClick={() => window.location.reload()}
            title="Refresh data"
          >
            ↻ Refresh
          </button>
        </div>
        <div className="timeline-container">
          <div className="timeline-feed">
            {timeline.length > 0 ? (
              timeline.map((event, index) => (
                <div className={`timeline-event ${event.type.toLowerCase()}`} key={index}>
                  <span className="event-badge">{event.type.charAt(0)}</span>
                  <div className="event-content">
                    <span className="event-details">
                      <strong>{event.user}</strong> {event.action}
                    </span>
                    <span className="event-time">{event.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activities">No recent activities found</div>
            )}
          </div>
          <div className="scroll-indicator">
            <div className="scroll-arrow">↓</div>
            <div className="scroll-text">Scroll for more</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;