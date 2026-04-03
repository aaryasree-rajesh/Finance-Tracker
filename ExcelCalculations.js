import React, { useState, useEffect } from 'react';

const ExcelCalculations = ({ lastDataCheck }) => {
  const [calculations, setCalculations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showFormulas, setShowFormulas] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  const fetchCalculations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/excel-calculations`);
      const data = await response.json();
      
      if (response.ok) {
        setCalculations(data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch Excel calculations');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, [lastDataCheck]);

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

  const calculationCards = [
    { key: 'total_income', label: 'Total Income', type: 'currency', color: 'green' },
    { key: 'total_expense', label: 'Total Expense', type: 'currency', color: 'red' },
    { key: 'balance', label: 'Balance', type: 'currency', color: 'blue' },
    { key: 'average_expense', label: 'Average Expense', type: 'currency', color: 'orange' },
    { key: 'average_income', label: 'Average Income', type: 'currency', color: 'teal' },
    { key: 'max_expense', label: 'Maximum Expense', type: 'currency', color: 'purple' },
    { key: 'min_expense', label: 'Minimum Expense', type: 'currency', color: 'pink' },
    { key: 'transaction_count', label: 'Total Transactions', type: 'number', color: 'gray' },
    { key: 'expense_count', label: 'Expense Count', type: 'number', color: 'red' },
    { key: 'income_count', label: 'Income Count', type: 'number', color: 'green' }
  ];

  const getFormulaDescription = (key) => {
    const formulas = {
      total_income: '=SUMIF(Sheet1!F:F,"Income",Sheet1!C:C)',
      total_expense: '=SUMIF(Sheet1!F:F,"Expense",Sheet1!C:C)',
      balance: '=B2-B3',
      average_expense: '=AVERAGEIF(Sheet1!F:F,"Expense",Sheet1!C:C)',
      average_income: '=AVERAGEIF(Sheet1!F:F,"Income",Sheet1!C:C)',
      max_expense: '=MAXIFS(Sheet1!C:C,Sheet1!F:F,"Expense")',
      min_expense: '=MINIFS(Sheet1!C:C,Sheet1!F:F,"Expense")',
      transaction_count: '=COUNTA(Sheet1!A:A)-1',
      expense_count: '=COUNTIF(Sheet1!F:F,"Expense")',
      income_count: '=COUNTIF(Sheet1!F:F,"Income")'
    };
    return formulas[key];
  };

  return (
    <div className="excel-calculations-container">
      <div className="excel-calc-header">
        <h2>Excel Calculations</h2>
        <div className="header-buttons">
          <button 
            className="toggle-formula-btn"
            onClick={() => setShowFormulas(!showFormulas)}
          >
            {showFormulas ? 'Hide Formulas' : 'Show Formulas'}
          </button>
          <button 
            className="refresh-btn"
            onClick={fetchCalculations}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="calculations-grid">
        {calculationCards.map((card, index) => (
          <div 
            key={card.key} 
            className={`calc-card ${card.color}`}
            onMouseEnter={() => setHoveredCard(card.key)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="calc-label">{card.label}</div>
            <div className="calc-value">
              {loading ? (
                <span className="loading-dots">...</span>
              ) : (
                <>
                  {card.type === 'currency' 
                    ? formatCurrency(calculations[card.key])
                    : formatNumber(calculations[card.key])
                  }
                </>
              )}
            </div>
            {showFormulas && (
              <div className="calc-formula-reveal">
                <code>{getFormulaDescription(card.key)}</code>
              </div>
            )}
            <div className="calc-indicator">
              {hoveredCard === card.key ? '✓ Formula Active' : 'Auto-Calculated'}
            </div>
          </div>
        ))}
      </div>

      <div className="excel-info">
        <div className="info-header">
          <h3>About Excel Calculations</h3>
          <button 
            className="info-toggle-btn"
            onClick={() => document.querySelector('.excel-info').classList.toggle('expanded')}
          >
            {document.querySelector('.excel-info')?.classList.contains('expanded') ? '▲ Collapse' : '▼ Expand'}
          </button>
        </div>
        <p>
          These values are calculated using <strong>Excel formulas</strong> stored in the <strong>Calculations</strong> sheet 
          of your finance_data.xlsx file. The formulas automatically update when you add, edit, or delete transactions.
        </p>
        <div className="formula-list">
          <h4>Excel Formulas Used:</h4>
          <ul>
            <li>
              <div className="formula-item">
                <code>=SUMIF(Sheet1!F:F,"Income",Sheet1!C:C)</code>
                <span className="formula-desc">Total Income</span>
              </div>
            </li>
            <li>
              <div className="formula-item">
                <code>=SUMIF(Sheet1!F:F,"Expense",Sheet1!C:C)</code>
                <span className="formula-desc">Total Expense</span>
              </div>
            </li>
            <li>
              <div className="formula-item">
                <code>=B2-B3</code>
                <span className="formula-desc">Balance</span>
              </div>
            </li>
            <li>
              <div className="formula-item">
                <code>=AVERAGEIF(Sheet1!F:F,"Expense",Sheet1!C:C)</code>
                <span className="formula-desc">Average Expense</span>
              </div>
            </li>
            <li>
              <div className="formula-item">
                <code>=MAXIFS(Sheet1!C:C,Sheet1!F:F,"Expense")</code>
                <span className="formula-desc">Maximum Expense</span>
              </div>
            </li>
            <li>
              <div className="formula-item">
                <code>=MINIFS(Sheet1!C:C,Sheet1!F:F,"Expense")</code>
                <span className="formula-desc">Minimum Expense</span>
              </div>
            </li>
            <li>
              <div className="formula-item">
                <code>=COUNTIF(Sheet1!F:F,"Expense")</code>
                <span className="formula-desc">Expense Count</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExcelCalculations;
