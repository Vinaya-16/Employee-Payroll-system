// database/init.js
const { initialize, closePool, oracledb } = require('./config');

async function initializeDatabase() {
  let connection;
  try {
    await initialize();
    connection = await oracledb.getConnection();

    // Create Employees table
    await connection.execute(`
      BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE employees CASCADE CONSTRAINTS';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -942 THEN
            RAISE;
          END IF;
      END;
    `);

    await connection.execute(`
      CREATE TABLE employees (
        employee_id NUMBER PRIMARY KEY,
        name VARCHAR2(100) NOT NULL,
        salary NUMBER(10,2) NOT NULL,
        location VARCHAR2(100),
        department VARCHAR2(100),
        status VARCHAR2(20) DEFAULT 'Active',
        created_date DATE DEFAULT SYSDATE
      )
    `);

    // Create Payroll table
    await connection.execute(`
      BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE payroll CASCADE CONSTRAINTS';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -942 THEN
            RAISE;
          END IF;
      END;
    `);

    await connection.execute(`
      CREATE TABLE payroll (
        payroll_id NUMBER PRIMARY KEY,
        employee_id NUMBER REFERENCES employees(employee_id),
        month_year VARCHAR2(7) NOT NULL,
        base_salary NUMBER(10,2) NOT NULL,
        working_days NUMBER(3) DEFAULT 22,
        overtime_hours NUMBER(5,2) DEFAULT 0,
        bonus NUMBER(10,2) DEFAULT 0,
        deductions NUMBER(10,2) DEFAULT 0,
        net_salary NUMBER(10,2) NOT NULL,
        created_date DATE DEFAULT SYSDATE
      )
    `);

    // Create Notifications table
    await connection.execute(`
      BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE notifications CASCADE CONSTRAINTS';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -942 THEN
            RAISE;
          END IF;
      END;
    `);

    await connection.execute(`
      CREATE TABLE notifications (
        notification_id NUMBER PRIMARY KEY,
        message VARCHAR2(500) NOT NULL,
        type VARCHAR2(20) DEFAULT 'medium',
        status VARCHAR2(20) DEFAULT 'PENDING',
        created_date DATE DEFAULT SYSDATE
      )
    `);

    // Create Audit Logs table
    await connection.execute(`
      BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE audit_logs CASCADE CONSTRAINTS';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -942 THEN
            RAISE;
          END IF;
      END;
    `);

    await connection.execute(`
      CREATE TABLE audit_logs (
        log_id NUMBER PRIMARY KEY,
        action VARCHAR2(50) NOT NULL,
        details VARCHAR2(1000),
        timestamp DATE DEFAULT SYSDATE
      )
    `);

    // Create sequences
    await connection.execute(`
      BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_employees';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -2289 THEN
            RAISE;
          END IF;
      END;
    `);

    await connection.execute('CREATE SEQUENCE seq_employees START WITH 1 INCREMENT BY 1');
    await connection.execute('CREATE SEQUENCE seq_payroll START WITH 1 INCREMENT BY 1');
    await connection.execute('CREATE SEQUENCE seq_notifications START WITH 1 INCREMENT BY 1');
    await connection.execute('CREATE SEQUENCE seq_audit_logs START WITH 1 INCREMENT BY 1');

    // Insert sample data
    await connection.execute(`
      INSERT INTO employees (employee_id, name, salary, location, department) 
      VALUES (seq_employees.NEXTVAL, 'John Doe', 5000, 'New York', 'Engineering')
    `);

    await connection.execute(`
      INSERT INTO employees (employee_id, name, salary, location, department) 
      VALUES (seq_employees.NEXTVAL, 'Jane Smith', 6000, 'Chicago', 'Marketing')
    `);

    await connection.execute(`
      INSERT INTO employees (employee_id, name, salary, location, department) 
      VALUES (seq_employees.NEXTVAL, 'Robert Johnson', 5500, 'Los Angeles', 'Sales')
    `);

    await connection.execute(`
      INSERT INTO notifications (notification_id, message, type) 
      VALUES (seq_notifications.NEXTVAL, 'Salary anomaly detected for Employee ID: 2', 'high')
    `);

    await connection.execute(`
      INSERT INTO audit_logs (log_id, action, details) 
      VALUES (seq_audit_logs.NEXTVAL, 'SYSTEM_START', 'Database initialized successfully')
    `);

    await connection.commit();
    console.log('✅ Database tables created and sample data inserted!');

  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('❌ Error closing connection:', err.message);
      }
    }
    await closePool();
  }
}

initializeDatabase();