const express = require('express');
const oracledb = require('oracledb');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));  // Serve frontend files

// Database Connection Config (replace with your details)
const dbConfig = {
  user: 'your_username',
  password: 'your_password',
  connectString: 'localhost:1521/your_sid'  // e.g., Oracle connection string
};

// Helper to execute queries
async function runQuery(query, binds = []) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, binds, { autoCommit: true });
    return result;
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) await connection.close();
  }
}

// Endpoint: Get Employee Data
app.get('/employees', async (req, res) => {
  const result = await runQuery('SELECT * FROM Employees');
  res.json(result.rows);
});

// Endpoint: Process Salary
app.post('/calculate-salary', async (req, res) => {
  const { emp_id, month_year } = req.body;
  await runQuery('BEGIN Calculate_Salary(:1, :2); END;', [emp_id, month_year]);
  res.send('Salary processed');
});

// Endpoint: Get Notifications (for HR dashboard)
app.get('/notifications', async (req, res) => {
  const result = await runQuery('SELECT * FROM Notifications WHERE status = \'Pending\'');
  res.json(result.rows);
});

// Endpoint: Get Audit Logs (for reporting)
app.get('/audit-logs', async (req, res) => {
  const result = await runQuery('SELECT * FROM Audit_Logs ORDER BY change_date DESC');
  res.json(result.rows);
});

// More endpoints as needed (e.g., insert attendance, approve leaves)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});