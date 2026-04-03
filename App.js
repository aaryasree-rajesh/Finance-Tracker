import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionTable from './components/TransactionTable';
import AIInsights from './components/AIInsights';
import ExcelCalculations from './components/ExcelCalculations';
import TotalMoney from './components/TotalMoney';
import Login from './components/Login';
import ExpensePrediction from './components/ExpensePrediction';
import ExcelCalculator from './components/ExcelCalculator';
import './App.css';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(0);
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Section visibility state
  const [activeSection, setActiveSection] = useState('all');
  const [lastDataCheck, setLastDataCheck] = useState(Date.now());
  const [syncStatus, setSyncStatus] = useState('idle');

  const refreshBalance = () => {
    setBalanceRefreshTrigger(prev => prev + 1);
  };

  const lastExcelTimeRef = useRef(null);

  // Poll for Excel file changes every 3 seconds
  useEffect(() => {
    if (!user) return;

    const checkForExcelChanges = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/check-excel-change?t=${Date.now()}`);
        const data = await response.json();
        
        if (response.ok && data.last_modified) {
          if (lastExcelTimeRef.current === null) {
            // First time loading, just store the timestamp
            lastExcelTimeRef.current = data.last_modified;
          } else if (data.last_modified > lastExcelTimeRef.current) {
            console.log('Excel file change detected. Waiting for Excel to finish saving...', data.last_modified);
            lastExcelTimeRef.current = data.last_modified;
            setSyncStatus('syncing');
            
            // Wait 2 seconds for Excel to fully finish writing/renaming its temporary files
            // This completely eliminates the sharing violation race condition on Windows
            setTimeout(async () => {
              await fetchTransactions();
              await fetchSummary();
              refreshBalance();
              setLastDataCheck(Date.now());
              setSyncStatus('idle');
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Error checking Excel changes:', err);
        setSyncStatus('idle');
      }
    };

    // Check immediately and then every 3 seconds
    checkForExcelChanges();
    const interval = setInterval(checkForExcelChanges, 3000);

    return () => clearInterval(interval);
  }, [user]);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch transactions when user is authenticated
  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchSummary();
    }
  }, [user]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.valid) {
          setUser(data.user);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    }
    setAuthLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // Clear local storage and state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/transactions`);
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/summary`);
      const data = await response.json();
      
      if (response.ok) {
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const handleManualRefresh = async () => {
    setSyncStatus('syncing');
    await fetchTransactions();
    await fetchSummary();
    refreshBalance();
    setLastDataCheck(Date.now());
    setSyncStatus('idle');
  };

  const handleDownloadCsv = () => {
    window.open(`${API_BASE_URL}/download-csv`, '_blank');
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchTransactions();
        await fetchSummary();
        refreshBalance(); // Refresh Total Money display
        setError('');
        return { success: true };
      } else {
        setError(data.error || 'Failed to add transaction');
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError('Failed to connect to server');
      return { success: false, error: 'Connection failed' };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransaction = async (id, transactionData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchTransactions();
        await fetchSummary();
        refreshBalance(); // Refresh Total Money display
        setError('');
        return { success: true };
      } else {
        setError(data.error || 'Failed to update transaction');
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError('Failed to connect to server');
      return { success: false, error: 'Connection failed' };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      setLoading(true);
      console.log('Deleting transaction:', id);
      
      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Delete response:', data);
      
      if (response.ok) {
        await fetchTransactions();
        await fetchSummary();
        refreshBalance(); // Refresh Total Money display
        setError('');
        return { success: true };
      } else {
        setError(data.error || 'Failed to delete transaction');
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to connect to server: ' + err.message);
      return { success: false, error: 'Connection failed' };
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="App">
        <div className="auth-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Finance Tracker</h1>
            <p>Track your income and expenses with Excel backend</p>
          </div>
          <div className="user-menu">
            <span className="user-greeting">Hello, {user.name || user.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Navigation Buttons */}
      <nav className="section-navigation">
        <button 
          className={`nav-btn ${activeSection === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSection('all')}
        >
          Show All
        </button>
        <button 
          className={`nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSection('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeSection === 'excel' ? 'active' : ''}`}
          onClick={() => setActiveSection('excel')}
        >
          Excel Data
        </button>
        <button 
          className={`nav-btn ${activeSection === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveSection('ai')}
        >
          AI Advisor
        </button>
        <button 
          className={`nav-btn ${activeSection === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveSection('calculator')}
        >
          Calculator
        </button>
        <button 
          className={`nav-btn ${activeSection === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveSection('transactions')}
        >
          Transactions
        </button>
      </nav>
      
      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">
              ×
            </button>
          </div>
        )}
        
        {(activeSection === 'all' || activeSection === 'dashboard') && (
          <>
            <Dashboard
              summary={summary}
              onDownloadCsv={handleDownloadCsv}
              onRefreshData={handleManualRefresh}
              lastSyncTime={lastDataCheck}
              syncStatus={syncStatus}
            />
          </>
        )}
        
        {(activeSection === 'all' || activeSection === 'dashboard') && (
          <TotalMoney onBalanceUpdate={fetchSummary} refreshTrigger={balanceRefreshTrigger} />
        )}
        
        {(activeSection === 'all' || activeSection === 'excel') && (
          <ExcelCalculations lastDataCheck={lastDataCheck} />
        )}
        
        {(activeSection === 'all' || activeSection === 'ai') && (
          <AIInsights loading={loading} lastDataCheck={lastDataCheck} />
        )}
        
        {(activeSection === 'all' || activeSection === 'calculator') && (
          <ExcelCalculator lastDataCheck={lastDataCheck} />
        )}
        
        {(activeSection === 'all' || activeSection === 'dashboard') && (
          <ExpensePrediction lastDataCheck={lastDataCheck} />
        )}
        
        {(activeSection === 'all' || activeSection === 'transactions') && (
          <div className="content-container">
            <div className="form-section">
              <h2>Add New Transaction</h2>
              <TransactionForm 
                onSubmit={handleAddTransaction}
                loading={loading}
              />
            </div>
            
            <div className="table-section">
              <h2>Transaction History</h2>
              <TransactionTable 
                transactions={transactions}
                onUpdate={handleUpdateTransaction}
                onDelete={handleDeleteTransaction}
                loading={loading}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;