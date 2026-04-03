import React, { useState, useEffect, useRef } from 'react';

const AIInsights = ({ loading: parentLoading, lastDataCheck }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  
  // Savings goal state
  const [goalForm, setGoalForm] = useState({
    goal_name: '',
    goal_amount: '',
    target_date: ''
  });
  const [goalResult, setGoalResult] = useState(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', text: "Hello! I'm your AI Financial Advisor. I can help you with:\n• Spending less and saving more\n• Budgeting strategies\n• Debt payoff advice\n• Investment basics\n• Or just chat!\n\nWhat would you like to talk about?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Excel viewer state
  const [excelData, setExcelData] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    fetchInsights();
    
    // If we're on the excel tab, also refresh the raw excel data
    if (activeTab === 'excel') {
      fetchExcelData();
    }
  }, [lastDataCheck]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/ai-insights`);
      const data = await response.json();
      
      if (response.ok) {
        setInsights(data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch insights');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    
    if (!goalForm.goal_amount || !goalForm.target_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/savings-goal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal_name: goalForm.goal_name || 'My Savings Goal',
          goal_amount: parseFloat(goalForm.goal_amount),
          target_date: goalForm.target_date
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setGoalResult(data);
        setError('');
      } else {
        setError(data.error || 'Failed to calculate goal');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'excellent': return 'A';
      case 'good': return 'B';
      case 'fair': return 'C';
      case 'concerning': return 'D';
      default: return 'N/A';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'excellent': return '#10B981';
      case 'good': return '#2563EB';
      case 'fair': return '#F59E0B';
      case 'concerning': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setChatMessages(prev => [...prev, { type: 'ai', text: data.response }]);
      } else {
        setChatMessages(prev => [...prev, { type: 'ai', text: "I'm here to help! Ask me about spending less, budgeting, or just say hi!" }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { type: 'ai', text: "I'm having trouble connecting, but I'm here to help with your finances! Try asking about spending less or budgeting tips." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatChatMessage = (text) => {
    const cleanText = text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();
    return cleanText.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  const fetchExcelData = async () => {
    try {
      setExcelLoading(true);
      const response = await fetch(`${API_BASE_URL}/excel-data`);
      const data = await response.json();
      
      if (response.ok) {
        setExcelData(data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch Excel data');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setExcelLoading(false);
    }
  };

  const downloadCSV = () => {
    window.open(`${API_BASE_URL}/download-csv`, '_blank');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="ai-insights-container">
      <div className="ai-header">
        <h2>AI Financial Advisor</h2>
        <button 
          className="refresh-btn"
          onClick={fetchInsights}
          disabled={loading || parentLoading}
        >
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="ai-error">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="ai-tabs">
        <button 
          className={`ai-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button 
          className={`ai-tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          Insights
        </button>
        <button 
          className={`ai-tab ${activeTab === 'breakdown' ? 'active' : ''}`}
          onClick={() => setActiveTab('breakdown')}
        >
          Breakdown
        </button>
        <button 
          className={`ai-tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
        <button 
          className={`ai-tab ${activeTab === 'excel' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('excel');
            fetchExcelData();
          }}
        >
          Excel Data
        </button>
      </div>

      <div className="ai-content">
        {activeTab === 'chat' && (
          <div className="chat-tab">
            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.type}`}>
                    <div className="chat-avatar">
                      {msg.type === 'ai' ? 'AI' : 'You'}
                    </div>
                    <div className="chat-bubble">
                      {formatChatMessage(msg.text)}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message ai">
                    <div className="chat-avatar">AI</div>
                    <div className="chat-bubble typing">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <form className="chat-input-form" onSubmit={handleChatSubmit}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything... (e.g., 'How do I spend less?', 'Hi', 'Help me budget')"
                  className="chat-input"
                  disabled={chatLoading}
                />
                <button 
                  type="submit" 
                  className="chat-send-btn"
                  disabled={chatLoading || !chatInput.trim()}
                >
                  {chatLoading ? '...' : 'Send'}
                </button>
              </form>
              
              <div className="chat-suggestions">
                <span className="suggestion-label">Try asking:</span>
                <div className="suggestion-buttons">
                  <button 
                    className="suggestion-btn"
                    onClick={() => setChatInput('How do I spend less?')}
                  >
                    How do I spend less?
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => setChatInput('Help me budget better')}
                  >
                    Help me budget
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => setChatInput('How can I save more money?')}
                  >
                    Save more money
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => setChatInput('Hi')}
                  >
                    Say Hi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-tab">
            {insights && (
              <>
                <div className="ai-summary-cards">
                  <div className="ai-card" style={{ borderLeftColor: getTrendColor(insights.spending_trend) }}>
                    <div className="ai-card-icon">{getTrendIcon(insights.spending_trend)}</div>
                    <div className="ai-card-content">
                      <h4>Savings Rate</h4>
                      <p className="ai-metric">{insights.savings_rate.toFixed(1)}%</p>
                      <span className="ai-status" style={{ color: getTrendColor(insights.spending_trend) }}>
                        {insights.spending_trend.charAt(0).toUpperCase() + insights.spending_trend.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="ai-card" style={{ borderLeftColor: '#EF4444' }}>
                    <div className="ai-card-icon">Top</div>
                    <div className="ai-card-content">
                      <h4>Top Spending</h4>
                      <p className="ai-metric">{insights.top_spending_category || 'N/A'}</p>
                      <span className="ai-status">
                        {insights.top_spending_amount ? formatCurrency(insights.top_spending_amount) : '₹0.00'}
                      </span>
                    </div>
                  </div>

                  <div className="ai-card" style={{ borderLeftColor: '#2563EB' }}>
                    <div className="ai-card-icon">Total</div>
                    <div className="ai-card-content">
                      <h4>Transactions</h4>
                      <p className="ai-metric">{insights.total_transactions}</p>
                      <span className="ai-status">Total tracked</span>
                    </div>
                  </div>
                </div>

                <div className="insights-section">
                  <h3>AI Insights</h3>
                  <div className="insights-list">
                    {insights.insights.map((insight, index) => (
                      <div key={index} className="insight-item">
                        <span className="insight-bullet">▸</span>
                        <p>{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="recommendations-section">
                  <h3>AI Recommendations</h3>
                  <div className="recommendations-list">
                    {insights.recommendations.map((rec, index) => (
                      <div key={index} className="recommendation-item">
                        <span className="rec-icon">-</span>
                        <p>{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!insights && !loading && (
              <div className="no-data">
                <p>No data available. Add some transactions to get AI insights!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="breakdown-tab">
            {insights && insights.total_transactions > 0 ? (
              <>
                {insights.category_breakdown && Object.keys(insights.category_breakdown).length > 0 && (
                  <div className="category-section">
                    <h3>Spending by Category</h3>
                    <div className="category-list">
                      {Object.entries(insights.category_breakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, amount], index) => (
                          <div key={category} className="category-item">
                            <div className="category-info">
                              <span className="category-rank">#{index + 1}</span>
                              <span className="category-name">{category}</span>
                            </div>
                            <div className="category-bar-container">
                              <div 
                                className="category-bar"
                                style={{ 
                                  width: `${insights.top_spending_amount > 0 ? (amount / insights.top_spending_amount * 100) : 0}%`,
                                  backgroundColor: index === 0 ? '#EF4444' : '#2563EB'
                                }}
                              />
                            </div>
                            <span className="category-amount">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {insights.category_income && Object.keys(insights.category_income).length > 0 && (
                  <div className="category-section">
                    <h3>Income by Category</h3>
                    <div className="category-list">
                      {Object.entries(insights.category_income)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, amount], index) => (
                          <div key={category} className="category-item income">
                            <div className="category-info">
                              <span className="category-rank">#{index + 1}</span>
                              <span className="category-name">{category}</span>
                            </div>
                            <div className="category-bar-container">
                              <div 
                                className="category-bar"
                                style={{ 
                                  width: '100%',
                                  backgroundColor: '#10B981'
                                }}
                              />
                            </div>
                            <span className="category-amount income">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {insights.monthly_comparison && Object.keys(insights.monthly_comparison).length > 0 && (
                  <div className="monthly-section">
                    <h3>Monthly Comparison</h3>
                    <div className="monthly-list">
                      {Object.entries(insights.monthly_comparison)
                        .sort((a, b) => b[0].localeCompare(a[0]))
                        .slice(0, 6)
                        .map(([month, data]) => (
                          <div key={month} className="month-item">
                            <span className="month-label">{month}</span>
                            <div className="month-bars">
                              <div className="month-bar-income" style={{ width: `${Math.min((data.income || 0) / 1000, 100)}%` }}>
                                <span>{formatCurrency(data.income || 0)}</span>
                              </div>
                              <div className="month-bar-expense" style={{ width: `${Math.min((data.expense || 0) / 1000, 100)}%` }}>
                                <span>{formatCurrency(data.expense || 0)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="month-legend">
                      <span className="legend-income">Income</span>
                      <span className="legend-expense">Expense</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-data">
                <p>No data available. Add some transactions to see breakdown!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="goals-tab">
            <div className="goal-form-section">
              <h3>Set Your Savings Goal</h3>
              <form onSubmit={handleGoalSubmit} className="goal-form">
                <div className="form-group">
                  <label>Goal Name</label>
                  <input
                    type="text"
                    value={goalForm.goal_name}
                    onChange={(e) => setGoalForm({...goalForm, goal_name: e.target.value})}
                    placeholder="e.g., New Car, Vacation, Emergency Fund"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Target Amount *</label>
                    <input
                      type="number"
                      value={goalForm.goal_amount}
                      onChange={(e) => setGoalForm({...goalForm, goal_amount: e.target.value})}
                      placeholder="5000"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Target Date *</label>
                    <input
                      type="date"
                      value={goalForm.target_date}
                      onChange={(e) => setGoalForm({...goalForm, target_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <button type="submit" className="goal-submit-btn" disabled={loading}>
                  {loading ? 'Calculating...' : 'Calculate Goal'}
                </button>
              </form>
            </div>

            {goalResult && (
              <div className="goal-result">
                <h3>Goal Progress</h3>
                
                <div className="goal-progress-card">
                  <div className="goal-header">
                    <h4>{goalResult.goal_name}</h4>
                    <span className={`goal-status ${goalResult.on_track ? 'on-track' : 'behind'}`}>
                      {goalResult.on_track ? 'On Track' : 'Behind'}
                    </span>
                  </div>
                  
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar"
                      style={{ width: `${Math.min(goalResult.progress_percentage, 100)}%` }}
                    />
                    <span className="progress-text">{goalResult.progress_percentage.toFixed(1)}%</span>
                  </div>
                  
                  <div className="goal-stats">
                    <div className="goal-stat">
                      <span className="stat-label">Current</span>
                      <span className="stat-value">{formatCurrency(goalResult.current_balance)}</span>
                    </div>
                    <div className="goal-stat">
                      <span className="stat-label">Goal</span>
                      <span className="stat-value">{formatCurrency(goalResult.goal_amount)}</span>
                    </div>
                    <div className="goal-stat">
                      <span className="stat-label">Remaining</span>
                      <span className="stat-value">{formatCurrency(goalResult.remaining)}</span>
                    </div>
                  </div>
                </div>

                <div className="savings-plan">
                  <h4>Savings Plan</h4>
                  <div className="savings-stats">
                    <div className="savings-stat">
                      <span className="savings-icon">Days</span>
                      <span className="savings-label">Days Left</span>
                      <span className="savings-value">{goalResult.days_remaining}</span>
                    </div>
                    <div className="savings-stat">
                      <span className="savings-icon">Day</span>
                      <span className="savings-label">Daily</span>
                      <span className="savings-value">{formatCurrency(goalResult.daily_savings_needed)}</span>
                    </div>
                    <div className="savings-stat">
                      <span className="savings-icon">Week</span>
                      <span className="savings-label">Weekly</span>
                      <span className="savings-value">{formatCurrency(goalResult.weekly_savings_needed)}</span>
                    </div>
                    <div className="savings-stat">
                      <span className="savings-icon">Month</span>
                      <span className="savings-label">Monthly</span>
                      <span className="savings-value">{formatCurrency(goalResult.monthly_savings_needed)}</span>
                    </div>
                  </div>
                </div>

                <div className="goal-advice">
                  <h4>AI Advice</h4>
                  {goalResult.advice.map((tip, index) => (
                    <div key={index} className="advice-item">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'excel' && (
          <div className="excel-tab">
            <div className="excel-header">
              <h3>Excel Data Viewer</h3>
              <div className="excel-actions">
                <button 
                  className="refresh-excel-btn"
                  onClick={fetchExcelData}
                  disabled={excelLoading}
                >
                  {excelLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button 
                  className="download-csv-btn"
                  onClick={downloadCSV}
                >
                  Download CSV
                </button>
              </div>
            </div>

            {excelLoading && (
              <div className="excel-loading">
                <div className="loading-spinner"></div>
                <p>Loading Excel data...</p>
              </div>
            )}

            {!excelLoading && excelData && (
              <>
                <div className="excel-info">
                  <span className="excel-filename">{excelData.filename}</span>
                  <span className="excel-rows">{excelData.total_rows} transactions</span>
                </div>

                {excelData.total_rows > 0 ? (
                  <div className="excel-table-container">
                    <table className="excel-table">
                      <thead>
                        <tr>
                          {excelData.headers.map((header, index) => (
                            <th key={index}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.data.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {excelData.headers.map((header, colIndex) => (
                              <td key={colIndex}>
                                {header === 'Amount' ? formatCurrency(row[header]) : 
                                 header === 'Type' ? (
                                   <span className={`excel-type-badge ${(row[header] || '').toLowerCase()}`}>
                                     {row[header]}
                                   </span>
                                 ) : row[header]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-excel-data">
                    <p>No data in Excel file yet.</p>
                    <p>Add some transactions to see them here!</p>
                  </div>
                )}
              </>
            )}

            {!excelLoading && !excelData && (
              <div className="no-excel-data">
                <p>Failed to load Excel data.</p>
                <button onClick={fetchExcelData} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;