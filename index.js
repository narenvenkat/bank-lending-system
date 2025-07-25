// bank-lending-system/index.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const app = express();
app.use(express.json());

// DB setup
const db = new sqlite3.Database(":memory:");

// Init tables
const initDb = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE Customers (
      customer_id TEXT PRIMARY KEY,
      name TEXT,
      created_at TEXT
    )`);

    db.run(`CREATE TABLE Loans (
      loan_id TEXT PRIMARY KEY,
      customer_id TEXT,
      principal_amount REAL,
      total_amount REAL,
      interest_rate REAL,
      loan_period_years INTEGER,
      monthly_emi REAL,
      status TEXT,
      created_at TEXT
    )`);

    db.run(`CREATE TABLE Payments (
      payment_id TEXT PRIMARY KEY,
      loan_id TEXT,
      amount REAL,
      payment_type TEXT,
      payment_date TEXT
    )`);
  });
};

initDb();

// Routes
app.post("/api/v1/loans", (req, res) => {
  const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;
  const I = loan_amount * loan_period_years * (interest_rate_yearly / 100);
  const A = loan_amount + I;
  const monthly_emi = parseFloat((A / (loan_period_years * 12)).toFixed(2));
  const loan_id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO Loans VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      loan_id,
      customer_id,
      loan_amount,
      A,
      interest_rate_yearly,
      loan_period_years,
      monthly_emi,
      "ACTIVE",
      now
    ],
    err => {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ loan_id, customer_id, total_amount_payable: A, monthly_emi });
    }
  );
});

app.post("/api/v1/loans/:loan_id/payments", (req, res) => {
  const { loan_id } = req.params;
  const { amount, payment_type } = req.body;
  const now = new Date().toISOString();

  db.get(`SELECT * FROM Loans WHERE loan_id = ?`, [loan_id], (err, loan) => {
    if (!loan) return res.status(404).json({ error: "Loan not found" });

    db.all(`SELECT SUM(amount) as paid FROM Payments WHERE loan_id = ?`, [loan_id], (err, rows) => {
      const paid = rows[0].paid || 0;
      const remaining = loan.total_amount - paid - amount;
      const emis_left = Math.ceil(remaining / loan.monthly_emi);

      db.run(
        `INSERT INTO Payments VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), loan_id, amount, payment_type, now],
        err => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({
            payment_id: uuidv4(),
            loan_id,
            message: "Payment recorded successfully.",
            remaining_balance: Math.max(remaining, 0),
            emis_left: Math.max(emis_left, 0)
          });
        }
      );
    });
  });
});

app.get("/api/v1/loans/:loan_id/ledger", (req, res) => {
  const { loan_id } = req.params;

  db.get(`SELECT * FROM Loans WHERE loan_id = ?`, [loan_id], (err, loan) => {
    if (!loan) return res.status(404).json({ error: "Loan not found" });

    db.all(`SELECT * FROM Payments WHERE loan_id = ?`, [loan_id], (err, transactions) => {
      const amount_paid = transactions.reduce((sum, t) => sum + t.amount, 0);
      const balance_amount = loan.total_amount - amount_paid;
      const emis_left = Math.ceil(balance_amount / loan.monthly_emi);

      res.json({
        loan_id,
        customer_id: loan.customer_id,
        principal: loan.principal_amount,
        total_amount: loan.total_amount,
        monthly_emi: loan.monthly_emi,
        amount_paid,
        balance_amount: Math.max(balance_amount, 0),
        emis_left: Math.max(emis_left, 0),
        transactions
      });
    });
  });
});

app.get("/api/v1/customers/:customer_id/overview", (req, res) => {
  const { customer_id } = req.params;

  db.all(`SELECT * FROM Loans WHERE customer_id = ?`, [customer_id], (err, loans) => {
    if (!loans.length) return res.status(404).json({ error: "No loans found" });

    const getLoanDetails = loan => {
      return new Promise(resolve => {
        db.all(`SELECT SUM(amount) as paid FROM Payments WHERE loan_id = ?`, [loan.loan_id], (err, rows) => {
          const amount_paid = rows[0].paid || 0;
          const emis_left = Math.ceil((loan.total_amount - amount_paid) / loan.monthly_emi);
          resolve({
            loan_id: loan.loan_id,
            principal: loan.principal_amount,
            total_amount: loan.total_amount,
            total_interest: loan.total_amount - loan.principal_amount,
            emi_amount: loan.monthly_emi,
            amount_paid,
            emis_left: Math.max(emis_left, 0)
          });
        });
      });
    };

    Promise.all(loans.map(getLoanDetails)).then(details => {
      res.json({ customer_id, total_loans: loans.length, loans: details });
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
