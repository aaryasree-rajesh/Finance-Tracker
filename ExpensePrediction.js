import React, { useState, useEffect } from 'react';

const ExpensePrediction = ({ lastDataCheck }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/predict-expenses`);
      const data = await response.json();
      
      if (response.ok) {
        setPredictionData(data);
        setError('');
      } else {
        setError(data.error || data.message || 'Failed to fetch predictions');
        setPredictionData(null);
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [lastDataCheck]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'increasing': return 'UP';
      case 'decreasing': return 'DOWN';
      case 'stable': return 'STABLE';
      default: return 'N/A';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'increasing': return '#ef4444';
      case 'decreasing': return '#10b981';
      case 'stable': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="expense-prediction-container">
        <div className="prediction-loading">
          <div className="spinner">...</div>
          <p>Analyzing your expense data...</p>
        </div>
      </div>
    );
  }

  if (error && !predictionData) {
    return (
      <div className="expense-prediction-container">
        <div className="excel-calc-header">
          <h2>Expense Prediction</h2>
          <button 
            className="refresh-btn"
            onClick={fetchPredictions}
          >
            Retry
          </button>
        </div>
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
        <div className="info-box">
          <p><strong>Tip:</strong> Add more transaction history to get accurate predictions. You need at least 2 months of expense data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-prediction-container">
      <div className="excel-calc-header">
        <h2>AI Expense Prediction</h2>
        <button 
          className="refresh-btn"
          onClick={fetchPredictions}
          disabled={loading}
        >
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      {predictionData && (
        <>
          {/* Trend Summary */}
          <div className="trend-summary" style={{
            background: `linear-gradient(135deg, ${getTrendColor(predictionData.trend)}22, ${getTrendColor(predictionData.trend)}11)`,
            border: `2px solid ${getTrendColor(predictionData.trend)}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>{getTrendIcon(predictionData.trend)}</span>
              <div>
                <h3 style={{ margin: 0, color: getTrendColor(predictionData.trend) }}>Expense Trend</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                  Based on {predictionData.data_points} months of data
                </p>
              </div>
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>
              {predictionData.trend_message}
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ background: 'white', padding: '12px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Average Monthly</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {formatCurrency(predictionData.average_monthly_expense)}
                </div>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Last Month</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                  {formatCurrency(predictionData.last_month_expense)}
                </div>
              </div>
            </div>
          </div>

          {/* Future Predictions */}
          <div className="predictions-grid">
            <h3 style={{ gridColumn: '1 / -1', marginBottom: '10px' }}>Future Expense Predictions</h3>
            {predictionData.predictions.map((pred, index) => (
              <div key={index} className="prediction-card future">
                <div className="prediction-month">{pred.month}</div>
                <div className="prediction-amount">{formatCurrency(pred.predicted_amount)}</div>
                <div className="prediction-label">Predicted Expense</div>
                {index === 0 && (
                  <div className="next-month-badge">Next Month</div>
                )}
              </div>
            ))}
          </div>

          {/* Historical Data */}
          <div className="historical-data-section">
            <h3 style={{ marginBottom: '15px' }}>Historical Monthly Expenses</h3>
            <div className="history-chart">
              {predictionData.historical_data.map((hist, index) => (
                <div key={index} className="history-bar-container">
                  <div className="history-month">{hist.month}</div>
                  <div 
                    className="history-bar"
                    style={{
                      width: `${Math.min((hist.amount / Math.max(...predictionData.historical_data.map(h => h.amount))) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                    }}
                  >
                    <span className="bar-value">{formatCurrency(hist.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          {predictionData.insights && predictionData.insights.length > 0 && (
            <div className="ai-insights-box">
              <h3 style={{ marginBottom: '12px' }}>AI Insights</h3>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {predictionData.insights.map((insight, index) => (
                  <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Forecast Method Info */}
          <div className="forecast-info">
            <h4>About This Prediction</h4>
            <p>
              This prediction uses Excel's <strong>FORECAST.LINEAR</strong> formula, which applies linear regression 
              to your historical expense data to forecast future values. The algorithm analyzes your spending 
              patterns over {predictionData.data_points} months to predict the next 3 months.
            </p>
            <div style={{ marginTop: '12px', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
              <strong>Formula:</strong>
              <code style={{ display: 'block', marginTop: '8px', background: 'white', padding: '8px', borderRadius: '4px' }}>
                =FORECAST.LINEAR(x, known_y's, known_x's)
              </code>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .expense-prediction-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .prediction-loading {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          font-size: 48px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .predictions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .prediction-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          transition: transform 0.2s;
        }

        .prediction-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .prediction-card.future {
          border-left: 4px solid #8b5cf6;
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
        }

        .next-month-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #8b5cf6;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }

        .prediction-month {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .prediction-amount {
          font-size: 28px;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 8px;
        }

        .prediction-label {
          font-size: 13px;
          color: #6b7280;
        }

        .historical-data-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .history-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .history-bar-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .history-month {
          min-width: 80px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .history-bar {
          flex: 1;
          height: 40px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 12px;
          transition: width 0.5s ease;
          min-width: 100px;
        }

        .bar-value {
          color: white;
          font-weight: 600;
          font-size: 14px;
          white-space: nowrap;
        }

        .ai-insights-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #f59e0b;
          margin-bottom: 20px;
        }

        .forecast-info {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .forecast-info h4 {
          margin: 0 0 12px 0;
          color: #1f2937;
        }

        .forecast-info p {
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }

        .info-box {
          background: #dbeafe;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          margin-top: 20px;
        }

        .info-box p {
          margin: 0;
          color: #1e40af;
        }
      `}</style>
    </div>
  );
};

export default ExpensePrediction;
