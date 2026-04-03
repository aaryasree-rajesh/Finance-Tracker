import React, { useState } from 'react';

const Dashboard = ({ summary, lastSyncTime, onDownloadCsv, onRefreshData, syncStatus }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const cards = [
    {
      id: 'income',
      title: 'Total Income',
      amount: summary.total_income,
      icon: 'IN',
      color: 'income',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      emoji: ['IN', 'UP', 'TR']
    },
    {
      id: 'expense',
      title: 'Total Expense',
      amount: summary.total_expense,
      icon: 'EX',
      color: 'expense',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      emoji: ['EX', 'SP', 'DN']
    },
    {
      id: 'balance',
      title: 'Current Balance',
      amount: summary.balance,
      icon: 'BL',
      color: 'balance',
      gradient: summary.balance >= 0 
        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      emoji: summary.balance >= 0 ? ['OK', 'UP', 'ST'] : ['AL', 'RV', 'PL']
    }
  ];

  const getRandomEmoji = (emojis) => {
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const formatSyncTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="dashboard">
      <div className="summary-cards">
        {cards.map((card) => (
          <div 
            key={card.id}
            className={`card ${card.color}-card`}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: hoveredCard === card.id ? card.gradient : 'white',
              transform: hoveredCard === card.id ? 'translateY(-10px) scale(1.05)' : 'translateY(0) scale(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="card-emoji-bounce">
              {hoveredCard === card.id ? getRandomEmoji(card.emoji) : card.icon}
            </div>
            <h3 style={{
              color: hoveredCard === card.id ? 'white' : '#64748b'
            }}>{card.title}</h3>
            <p 
              className={`amount ${summary.balance >= 0 ? 'positive' : 'negative'}`}
              style={{
                color: hoveredCard === card.id ? 'white' : (hoveredCard === card.id ? 'white' : '#1e293b')
              }}
            >
              {formatCurrency(card.amount)}
            </p>
            {hoveredCard === card.id && (
              <div className="card-hover-effect">
                <span>Updated</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="dashboard-actions">
        <button className="action-btn pulse-btn" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
          Add Transaction
        </button>
        <button className="action-btn refresh-btn" onClick={onRefreshData}>
          Refresh Dashboard
        </button>
      </div>

      <div className="export-sync-section">
        <div className="export-sync-header">
          <h3>Data Export and Live Sync</h3>
          <p>Download all transactions and track live Excel updates.</p>
        </div>
        <div className="export-sync-actions">
          <button className="action-btn download-csv-btn" onClick={onDownloadCsv}>
            Download All Transactions CSV
          </button>
        </div>
        <div className="sync-meta">
          <span className={`sync-pill ${syncStatus || 'idle'}`}>
            {syncStatus === 'syncing' ? 'Syncing from Excel...' : 'Dashboard auto-sync is active'}
          </span>
          <span className="sync-time">Last sync: {formatSyncTime(lastSyncTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;