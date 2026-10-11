
import { useState } from "react";
import "./App.css";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Education",
  "Bills",
  "Entertainment",
  "Health",
  "Other"
];

function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10)
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onAdd({
      ...form,
      id: Date.now(),
      amount: Number(form.amount)
    });

    setForm({
      title: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().slice(0, 10)
    });
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">NEW TRANSACTION</span>
          <h2>Add an expense</h2>
        </div>
        <span className="heading-icon">＋</span>
      </div>

      <form onSubmit={handleSubmit} className="expense-form">
        <label>
          Expense name
          <input
            name="title"
            placeholder="e.g. Lunch with friends"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={80}
          />
        </label>

        <label>
          Amount (₹)
          <input
            name="amount"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            required
          />
        </label>

        <label>
          Category
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Expense date
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </label>

        <button className="primary-btn" type="submit">
          + Add Expense
        </button>
      </form>
    </section>
  );
}

function SummaryCard({ label, value, note, symbol, color }) {
  return (
    <div className="summary-card">
      <div className={`summary-icon ${color}`}>{symbol}</div>
      <p>{label}</p>
      <h2>{value}</h2>
      <span className="summary-note">{note}</span>
    </div>
  );
}

function CategoryAnalysis({ expenses }) {
  const totals = categories
    .map((category) => ({
      name: category,
      amount: expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0)
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const maxAmount = Math.max(
    ...totals.map((item) => item.amount),
    1
  );

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">SPENDING BREAKDOWN</span>
          <h2>Category analysis</h2>
        </div>
      </div>

      {totals.length === 0 ? (
        <p className="empty-message">
          Add your first expense to see the analysis.
        </p>
      ) : (
        <div className="category-list">
          {totals.map((item) => (
            <div className="category-item" key={item.name}>
              <div className="category-label">
                <span>{item.name}</span>
                <strong>
                  ₹{item.amount.toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                  })}
                </strong>
              </div>

              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(item.amount / maxAmount) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ExpenseHistory({ expenses, onDelete }) {
  const sortedExpenses = [...expenses].sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  return (
    <section className="panel history-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">YOUR RECORDS</span>
          <h2>Recent expenses</h2>
        </div>
        <span className="count-badge">
          {expenses.length} records
        </span>
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">₹</div>
          <h3>No expenses yet</h3>
          <p>Your added expenses will appear here.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Expense</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="expense-title">{expense.title}</td>
                  <td>
                    <span className="category-pill">
                      {expense.category}
                    </span>
                  </td>
                  <td>{expense.date}</td>
                  <td className="amount-cell">
                    ₹{expense.amount.toLocaleString("en-IN", {
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      type="button"
                      onClick={() => onDelete(expense.id)}
                      aria-label={`Delete ${expense.title}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function App() {
  const [expenses, setExpenses] = useState([]);

  const total = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const average = expenses.length ? total / expenses.length : 0;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyTotal = expenses
    .filter((expense) => expense.date.startsWith(thisMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const formatCurrency = (amount) =>
    "₹" + amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const addExpense = (expense) => {
    setExpenses((previous) => [...previous, expense]);
  };

  const deleteExpense = (id) => {
    setExpenses((previous) =>
      previous.filter((expense) => expense.id !== id)
    );
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <div>
            <h2>PennyWise</h2>
            <p>Personal finance tracker</p>
          </div>
        </div>
        <span className="topbar-tag">MY FINANCES</span>
      </header>

      <section className="welcome">
        <div>
          <span className="eyebrow">YOUR MONEY, YOUR CONTROL</span>
          <h1>Expense Dashboard</h1>
          <p>Track your spending. Understand your habits. Save smarter.</p>
        </div>
        <div className="welcome-decoration">₹</div>
      </section>

      <section className="summary-grid">
        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(total)}
          note="All recorded transactions"
          symbol="₹"
          color="purple"
        />
        <SummaryCard
          label="This Month"
          value={formatCurrency(monthlyTotal)}
          note="Spending in the current month"
          symbol="↗"
          color="blue"
        />
        <SummaryCard
          label="Average Expense"
          value={formatCurrency(average)}
          note="Per recorded transaction"
          symbol="∑"
          color="green"
        />
        <SummaryCard
          label="Transactions"
          value={expenses.length}
          note="Total expense records"
          symbol="#"
          color="orange"
        />
      </section>

      <section className="main-grid">
        <ExpenseForm onAdd={addExpense} />
        <CategoryAnalysis expenses={expenses} />
      </section>

      <ExpenseHistory
        expenses={expenses}
        onDelete={deleteExpense}
      />

      <footer>
        Built with React <span>♥</span> · Personal Expense Tracker
      </footer>
    </main>
  );
}

export default App;