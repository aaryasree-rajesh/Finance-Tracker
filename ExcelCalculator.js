import React, { useState, useEffect } from 'react';

const ExcelCalculator = ({ lastDataCheck }) => {
  const [selectedCalculations, setSelectedCalculations] = useState([]);
  const [calculationResults, setCalculationResults] = useState({});
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  // Available calculation options
  const calculationOptions = [
    { id: 'total_income', label: 'Total Income', category: 'basic' },
    { id: 'total_expense', label: 'Total Expense', category: 'basic' },
    { id: 'balance', label: 'Balance', category: 'basic' },
    { id: 'average_expense', label: 'Average Expense', category: 'basic' },
    { id: 'average_income', label: 'Average Income', category: 'basic' },
    { id: 'max_expense', label: '⬆️ Max Expense', category: 'basic' },
    { id: 'min_expense', label: '⬇️ Min Expense', category: 'basic' },
    { id: 'transaction_count', label: 'Total Transactions', category: 'basic' },
    { id: 'expense_count', label: 'Expense Count', category: 'basic' },
    { id: 'income_count', label: 'Income Count', category: 'basic' },
    { id: 'predictions', label: 'Future Predictions', category: 'advanced' },
    { id: 'trend_analysis', label: 'Trend Analysis', category: 'advanced' },
  ];

  const categories = ['basic', 'advanced'];

  const fetchCalculations = async () => {
    if (selectedCalculations.length === 0) return;

    try {
      setLoading(true);
      
      // Fetch basic calculations
      const hasBasicCalcs = selectedCalculations.some(id => 
        calculationOptions.find(opt => opt.id === id)?.category === 'basic'
      );
      
      if (hasBasicCalcs) {
        const response = await fetch(`${API_BASE_URL}/excel-calculations`);
        const data = await response.json();
        
        if (response.ok) {
          setCalculationResults(prev => ({ ...prev, ...data }));
          setError('');
        } else {
          setError(data.error || 'Failed to fetch calculations');
        }
      }

      // Fetch predictions if selected
      if (selectedCalculations.includes('predictions') || selectedCalculations.includes('trend_analysis')) {
        const predResponse = await fetch(`${API_BASE_URL}/predict-expenses`);
        const predData = await predResponse.json();
        
        if (predResponse.ok) {
          setPredictionData(predData);
        }
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchCalculations();
  }, [selectedCalculations, lastDataCheck]);

  const toggleCalculation = (calcId) => {
    setSelectedCalculations(prev => 
      prev.includes(calcId) 
        ? prev.filter(id => id !== calcId)
        : [...prev, calcId]
    );
  };

  const selectAll = (category) => {
    const categoryCalcs = calculationOptions
      .filter(opt => opt.category === category)
      .map(opt => opt.id);
    
    const allSelected = categoryCalcs.every(id => selectedCalculations.includes(id));
    
    if (allSelected) {
      setSelectedCalculations(prev => prev.filter(id => !categoryCalcs.includes(id)));
    } else {
      setSelectedCalculations(prev => [...new Set([...prev, ...categoryCalcs])]);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('en-IN');
  };

  const getCalculationValue = (key) => {
    const value = calculationResults[key];
    if (key.includes('count')) {
      return formatNumber(value);
    }
    return formatCurrency(value);
  };

  const renderCalculationCard = (calc) => {
    const value = getCalculationValue(calc.id);
    
    return (
      <div className="calc-result-card">
        <div className="calc-result-label">{calc.label}</div>
        <div className="calc-result-value">{value}</div>
      </div>
    );
  };

  const renderPredictionSection = () => {
    if (!predictionData || predictionData.error) return null;

    return (
      <div className="prediction-results-section">
        <h3 style={{ marginBottom: '15px', color: '#8b5cf6' }}>Prediction Results</h3>
        
        {selectedCalculations.includes('trend_analysis') && (
          <div className="trend-display" style={{
            background: `linear-gradient(135deg, ${getTrendColor(predictionData.trend)}22, ${getTrendColor(predictionData.trend)}11)`,
            border: `2px solid ${getTrendColor(predictionData.trend)}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{getTrendIcon(predictionData.trend)}</span>
              <div>
                <h4 style={{ margin: 0, color: getTrendColor(predictionData.trend) }}>Expense Trend</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                  {predictionData.trend_message}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedCalculations.includes('predictions') && predictionData.predictions && (
          <div className="predictions-mini-grid">
            {predictionData.predictions.slice(0, 2).map((pred, index) => (
              <div key={index} className="mini-prediction-card">
                <div className="mini-pred-month">{pred.month}</div>
                <div className="mini-pred-amount">{formatCurrency(pred.predicted_amount)}</div>
                <div className="mini-pred-label">Predicted</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
      case 'increasing': return '#fbbf24'; // Pastel amber
      case 'decreasing': return '#34d399'; // Pastel emerald
      case 'stable': return '#a78bfa'; // Pastel purple
      default: return '#9ca3af'; // Pastel gray
    }
  };

  return (
    <div className="excel-calculator-container">
      <div className="excel-calc-header">
        <h2>Excel Calculator</h2>
        <button 
          className="refresh-btn"
          onClick={fetchCalculations}
          disabled={loading}
        >
          {loading ? '...' : 'Refresh'} 
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="calculator-content">
        {/* Selection Panel */}
        <div className="calculation-selector">
          <h3 style={{ marginBottom: '15px' }}>Select Calculations</h3>
          
          {categories.map(category => (
            <div key={category} className="category-section">
              <div className="category-header">
                <h4 style={{ margin: 0, textTransform: 'capitalize' }}>
                  {category === 'basic' ? 'Basic Calculations' : 'Advanced Analytics'}
                </h4>
                <button 
                  className="select-all-btn"
                  onClick={() => selectAll(category)}
                >
                  {calculationOptions.filter(opt => opt.category === category).every(id => selectedCalculations.includes(id))
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>
              
              <div className="checkbox-grid">
                {calculationOptions
                  .filter(opt => opt.category === category)
                  .map(calc => (
                    <label key={calc.id} className={`calc-checkbox ${calc.category === 'advanced' ? 'advanced' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedCalculations.includes(calc.id)}
                        onChange={() => toggleCalculation(calc.id)}
                      />
                      <span>{calc.label}</span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Results Panel */}
        {selectedCalculations.length > 0 && (
          <div className="calculation-results">
            <h3 style={{ marginBottom: '15px' }}>
              Results ({selectedCalculations.length} selected)
            </h3>
            
            {/* Basic Calculation Results */}
            {selectedCalculations.some(id => 
              calculationOptions.find(opt => opt.id === id)?.category === 'basic'
            ) && (
              <div className="results-grid">
                {selectedCalculations
                  .filter(id => calculationOptions.find(opt => opt.id === id)?.category === 'basic')
                  .map(id => {
                    const calc = calculationOptions.find(opt => opt.id === id);
                    return calc ? renderCalculationCard(calc) : null;
                  })}
              </div>
            )}

            {/* Prediction Results */}
            {(selectedCalculations.includes('predictions') || selectedCalculations.includes('trend_analysis')) && 
              renderPredictionSection()}
          </div>
        )}

        {/* Empty State */}
        {selectedCalculations.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">Calculator</div>
            <h3>No Calculations Selected</h3>
            <p>Select calculations from the panel above to see results</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .excel-calculator-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .calculator-content {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        @media (max-width: 992px) {
          .calculator-content {
            grid-template-columns: 1fr;
          }
        }

        .calculation-selector {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .category-section {
          margin-bottom: 20px;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .category-header h4 {
          color: #1e293b;
          font-size: 1rem;
        }

        .select-all-btn {
          background: white;
          border: 2px solid #3b82f6;
          color: #3b82f6;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .select-all-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .checkbox-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .calc-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .calc-checkbox:hover {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .calc-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .calc-checkbox span {
          font-size: 0.9rem;
          color: #374151;
          font-weight: 500;
        }

        .calculation-results {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .calc-result-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          border-left: 4px solid #3b82f6;
          transition: transform 0.2s;
        }

        .calc-result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .calc-result-label {
          font-size: 0.85rem;
          color: #6b7280;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .calc-result-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .prediction-results-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
        }

        .predictions-mini-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
        }

        .mini-prediction-card {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          border-radius: 10px;
          padding: 15px;
          border-left: 4px solid #8b5cf6;
          text-align: center;
        }

        .mini-pred-month {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .mini-pred-amount {
          font-size: 1.5rem;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 4px;
        }

        .mini-pred-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          color: #374151;
          margin-bottom: 10px;
        }

        .empty-state p {
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};

export default ExcelCalculator;
