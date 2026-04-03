import React, { useState, useEffect } from 'react';

const TotalMoney = ({ onBalanceUpdate, refreshTrigger }) => {
  const [balance, setBalance] = useState({
    current_balance: 0,
    initial_balance: 0,
    last_updated: null
  });
  const [loading, setLoading] = useState(false);
  const [showSetBalance, setShowSetBalance] = useState(false);
  const [showQuickAdjust, setShowQuickAdjust] = useState(false);
  const [newBalance, setNewBalance] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchBalance();
  }, []);

  // Refresh balance when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchBalance();
    }
  }, [refreshTrigger]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/balance`);
      const data = await response.json();
      
      if (response.ok) {
        setBalance(data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBalance = async (e) => {
    e.preventDefault();
    
    if (!newBalance || isNaN(newBalance)) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/balance/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(newBalance) }),
      });

      const data = await response.json();

      if (response.ok) {
        setBalance({
          current_balance: data.current_balance,
          initial_balance: data.initial_balance,
          last_updated: new Date().toISOString()
        });
        setShowSetBalance(false);
        setNewBalance('');
        setError('');
        if (onBalanceUpdate) onBalanceUpdate(data.current_balance);
      } else {
        setError(data.error || 'Failed to set balance');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdjust = async (operation) => {
    if (!adjustAmount || isNaN(adjustAmount) || Number(adjustAmount) <= 0) {
      setError('Enter a valid amount greater than zero');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/balance/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(adjustAmount),
          operation,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchBalance();
        setAdjustAmount('');
        setError('');
        if (onBalanceUpdate) onBalanceUpdate(data.current_balance);
      } else {
        setError(data.error || 'Failed to update balance');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getBalanceStatus = () => {
    const diff = balance.current_balance - balance.initial_balance;
    if (diff > 0) return { text: 'Increased', color: '#10B981', icon: '▲' };
    if (diff < 0) return { text: 'Decreased', color: '#EF4444', icon: '▼' };
    return { text: 'Unchanged', color: '#6B7280', icon: '■' };
  };

  const status = getBalanceStatus();
  const difference = balance.current_balance - balance.initial_balance;

  return (
    <div className="total-money-container">
      <div className="total-money-card">
        <div className="total-money-header">
          <h3>Total Money</h3>
          <div className="header-actions">
            <button
              className="refresh-balance-btn"
              onClick={fetchBalance}
              disabled={loading}
              title="Refresh balance"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              className="quick-adjust-toggle-btn"
              onClick={() => setShowQuickAdjust((prev) => !prev)}
              disabled={loading}
            >
              {showQuickAdjust ? 'Close Quick Adjust' : 'Quick Adjust'}
            </button>
          </div>
        </div>

        {error && (
          <div className="balance-error">
            {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        <div className="balance-display">
          <div className="current-balance">
            <span className="balance-label">Current Balance</span>
            <span className={`balance-amount ${balance.current_balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(balance.current_balance)}
            </span>
          </div>

          {balance.initial_balance > 0 && (
            <div className="balance-comparison">
              <div className="initial-balance">
                <span className="comparison-label">Started with:</span>
                <span className="comparison-value">{formatCurrency(balance.initial_balance)}</span>
              </div>
              <div className="balance-change" style={{ color: status.color }}>
                <span className="change-icon" aria-hidden="true">{status.icon}</span>
                <span className="change-text">{status.text}</span>
                <span className="change-amount">
                  {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                </span>
              </div>
            </div>
          )}
        </div>

        {showQuickAdjust && (
          <div className="quick-adjust-panel">
            <h4>Quick Balance Adjustment</h4>
            <p className="quick-adjust-note">Use this for manual wallet/bank corrections.</p>
            <div className="quick-adjust-row">
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="Amount"
                step="0.01"
                min="0"
              />
              <button
                type="button"
                className="quick-add-btn"
                onClick={() => handleQuickAdjust('add')}
                disabled={loading}
              >
                Add
              </button>
              <button
                type="button"
                className="quick-subtract-btn"
                onClick={() => handleQuickAdjust('subtract')}
                disabled={loading}
              >
                Subtract
              </button>
            </div>
          </div>
        )}

        {!showSetBalance ? (
          <button 
            className="set-balance-btn"
            onClick={() => setShowSetBalance(true)}
          >
            {balance.initial_balance > 0 ? 'Update Balance' : 'Set Initial Balance'}
          </button>
        ) : (
          <form className="set-balance-form" onSubmit={handleSetBalance}>
            <div className="form-group">
              <label>Enter your current total money:</label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="0.00"
                step="0.01"
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="save-balance-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowSetBalance(false);
                  setNewBalance('');
                  setError('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="balance-info">
          <div className="info-item">
            <span className="info-icon">i</span>
            <span className="info-text">
              Expenses are automatically deducted from this balance
            </span>
          </div>
          <div className="info-item">
            <span className="info-icon">i</span>
            <span className="info-text">
              Income is automatically added to this balance
            </span>
          </div>
          {balance.last_updated && (
            <div className="last-updated">
              Last updated: {new Date(balance.last_updated).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalMoney;