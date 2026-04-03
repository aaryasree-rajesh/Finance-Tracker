# Finance Tracker - Excel Backend

A full-stack Finance Tracker web application where Excel (.xlsx file) is used as the backend database. Any change made in the web application instantly updates the Excel file automatically.

## 🚀 Tech Stack

**Frontend:**
- React.js
- HTML
- CSS
- JavaScript

**Backend:**
- Python
- Flask framework

**Excel Integration:**
- openpyxl library

**Communication:**
- REST API using JSON
- Fetch API in frontend

## 🎨 Features

### Core Functionality
1. **Add Transaction**
   - Date, Amount, Category, Description, Type (Income/Expense)
   - Instant Excel update on save

2. **View Transactions**
   - Table display with all transaction details
   - Edit and Delete buttons for each transaction

3. **Edit Transaction**
   - Inline editing capability
   - Instant Excel update

4. **Delete Transaction**
   - One-click deletion
   - Immediate Excel update

5. **Dashboard Summary**
   - Total Income card
   - Total Expense card
   - Current Balance card
   - Real-time calculations from Excel data

## 🎯 Color Palette

- **Primary Color:** #2563EB (Blue) - Buttons, Headers, Active elements
- **Secondary Color:** #10B981 (Green) - Income values, Balance card
- **Background Color:** #F1F5F9 (Light Neutral) - Page background, Cards

##📁 Project Structure

```
Finance Tracker/
├── backend/
│   ├── app.py              # Flask API server
│   ├── finance_data.xlsx   # Excel database file (auto-created)
│  └── requirements.txt    # Python dependencies
└── frontend/
    ├── public/
    │  └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.js
    │   │   ├── TransactionForm.js
    │   │  └── TransactionTable.js
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │  └── index.css
   └── package.json
```

##🛠️ Setup Instructions

### Prerequisites
- Python 3.7+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the Flask server:**
   ```bash
   python app.py
   ```
   
   The backend will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```
   
   The frontend will start on `http://localhost:3000`

##📊 Excel File Structure

**File:** `finance_data.xlsx` (auto-created in backend folder)

**Sheet:** `Sheet1`

**Columns:**
- ID (Auto-generated unique identifier)
- Date
- Amount
- Category
- Description
- Type

##🔌 EndI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add` | Add new transaction |
| GET | `/transactions` | Get all transactions |
| PUT | `/update/<id>` | Update transaction by ID |
| DELETE | `/delete/<id>` | Delete transaction by ID |
| GET | `/summary` | Get income/expense/balance summary |

## 🎯 Usage

1. **Add Transaction:**
   - Fill in the form with date, amount, category, description, and type
   - Click "Add Transaction" - data instantly saves to Excel

2. **View Transactions:**
   - All transactions display in the table below the form
   - Data is fetched from Excel via the backend API

3. **Edit Transaction:**
   - Click the edit (✏) button on any transaction
   - Modify fields in the table
   - Click save (✓) to update Excel

4. **Delete Transaction:**
   - Click the delete (🗑) button
   - Confirm deletion
   - Transaction is removed from Excel

5. **Dashboard Summary:**
   - Top cards show real-time calculations
   - Data refreshes automatically after any operation

##📝

- The Excel file is automatically created if it doesn't exist
- All operations instantly update the Excel file
- No manual saving or export required
- Data persists permanently in the Excel file
- The application works completely offline once set up

##🔧bleshooting

**Common Issues:**

1. **CORS Error:**
   - Ensure Flask backend is running on port 5000
   - Check that Flask-CORS is installed

2. **Excel File Not Creating:**
   - Check write permissions in the backend directory
   - Ensure openpyxl is properly installed

3. **Connection Failed:**
   - Verify both backend (port 5000) and frontend (port 3000) are running
   - Check firewall settings

4. **PowerShell Execution Policy (Windows):**
   - If you encounter script execution errors, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

##🚀 Deployment

For production deployment:

1. **Backend:**
   - Use a production WSGI server like Gunicorn
   - Set `debug=False` in app.py
   - Configure proper hosting (Heroku, AWS, etc.)

2. **Frontend:**
   - Build production version: `npm run build`
   - Deploy build folder to hosting service
   - Update API URL in App.js if backend URL changes

##📄 License

This project is for educational purposes. Feel free to modify and extend as needed.