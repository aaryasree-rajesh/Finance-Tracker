import React, { useState } from 'react';

const TransactionTable = ({ transactions, onUpdate, onDelete, loading }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const startEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditData({
      date: transaction.date,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      type: transaction.type
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveEdit = async (id) => {
    const result = await onUpdate(id, editData);
    if (result.success) {
      setEditingId(null);
      setEditData({});
    }
  };

  const handleDelete = async (id) => {
    console.log('handleDelete called with id:', id);
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      console.log('User confirmed deletion');
      const result = await onDelete(id);
      console.log('Delete result:', result);
    } else {
      console.log('User cancelled deletion');
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="no-transactions">
        <p>No transactions found. Add your first transaction above!</p>
      </div>
    );
  }

  return (
    <div className="transaction-table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              {editingId === transaction.id ? (
                <>
                  <td>
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(e) => handleEditChange('date', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editData.amount}
                      onChange={(e) => handleEditChange('amount', e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editData.category}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editData.description}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={editData.type}
                      onChange={(e) => handleEditChange('type', e.target.value)}
                    >
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="save-btn"
                        onClick={() => saveEdit(transaction.id)}
                        disabled={loading}
                      >
                        ✓
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={cancelEdit}
                        disabled={loading}
                      >
                       ✗                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{formatDate(transaction.date)}</td>
                  <td className={transaction.type === 'Income' ? 'income-amount' : 'expense-amount'}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td>{transaction.category}</td>
                  <td>{transaction.description}</td>
                  <td>
                    <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => startEdit(transaction)}
                        disabled={loading}
                      >
                       Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => {
                          console.log('Delete button clicked for id:', transaction.id);
                          handleDelete(transaction.id);
                        }}
                      >
                       Delete
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;