import React, { useState } from 'react';

const TransactionForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    category: '',
    description: '',
    type: 'Expense'
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.date || !formData.amount || !formData.category || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const result = await onSubmit({
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      type: formData.type
    });

    if (result.success) {
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form on successful submission
      setFormData({
        date: '',
        amount: '',
        category: '',
        description: '',
        type: 'Expense'
      });
    }
  };

  return (
    <div className="form-wrapper">
      {showSuccess && (
        <div className="success-animation">
          <div className="success-emoji">Done</div>
          <div className="success-text">Transaction Added Successfully!</div>
        </div>
      )}
      
      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>Add New Transaction</h2>
          <div className="type-selector">
            <span className={`type-badge ${formData.type === 'Income' ? 'active' : ''}`}>
              Income
            </span>
            <span className={`type-badge ${formData.type === 'Expense' ? 'active' : ''}`}>
              Expense
            </span>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="interactive-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="₹ 0.00"
              step="0.01"
              min="0"
              required
              className="interactive-input"
            />
          </div>
        </div>
        
        <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Food, Salary, Rent"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter transaction description"
          rows="3"
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="submit-btn"
        disabled={loading}
      >
        {loading ? (
          <span className="btn-loading">
            <span className="spinner">...</span> Saving...
          </span>
        ) : (
          <span className="btn-content">
            Add Transaction
          </span>
        )}
      </button>
    </form>
  </div>
);
};

export default TransactionForm;