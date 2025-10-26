-- 1. EMPLOYEES Table
CREATE TABLE employees (
    id NUMBER PRIMARY KEY,
    username VARCHAR2(50) UNIQUE NOT NULL,
    password VARCHAR2(100) NOT NULL,
    name VARCHAR2(100) NOT NULL,
    base_salary NUMBER NOT NULL,
    user_type VARCHAR2(20) DEFAULT 'employee',
    is_active NUMBER(1) DEFAULT 1,
    created_date DATE DEFAULT SYSDATE
);

-- 2. ATTENDANCE Table
CREATE TABLE attendance (
    id NUMBER PRIMARY KEY,
    employee_id NUMBER REFERENCES employees(id),
    attendance_date DATE NOT NULL,
    check_in_time VARCHAR2(10),
    check_out_time VARCHAR2(10),
    status VARCHAR2(20) DEFAULT 'Present',
    hours_worked NUMBER,
    created_date DATE DEFAULT SYSDATE
);

-- 3. SALARIES Table
CREATE TABLE salaries (
    id NUMBER PRIMARY KEY,
    employee_id NUMBER REFERENCES employees(id),
    month_year VARCHAR2(7) NOT NULL,
    base_salary NUMBER NOT NULL,
    bonus NUMBER DEFAULT 0,
    deductions NUMBER DEFAULT 0,
    final_salary NUMBER NOT NULL,
    status VARCHAR2(20) DEFAULT 'Pending',
    approved_by VARCHAR2(100),
    approved_date DATE,
    created_date DATE DEFAULT SYSDATE
);

-- 4. Create Sequences
CREATE SEQUENCE employees_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE attendance_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE salaries_seq START WITH 1 INCREMENT BY 1;

-- Insert Employees
INSERT INTO employees (id, username, password, name, base_salary, user_type) VALUES 
(employees_seq.NEXTVAL, 'emp1', 'emp123', 'John Doe', 30000, 'employee');

INSERT INTO employees (id, username, password, name, base_salary, user_type) VALUES 
(employees_seq.NEXTVAL, 'emp2', 'emp123', 'Jane Smith', 32000, 'employee');

INSERT INTO employees (id, username, password, name, base_salary, user_type) VALUES 
(employees_seq.NEXTVAL, 'emp3', 'emp123', 'Mike Johnson', 28000, 'employee');

INSERT INTO employees (id, username, password, name, base_salary, user_type) VALUES 
(employees_seq.NEXTVAL, 'emp4', 'emp123', 'Sarah Wilson', 35000, 'employee');

INSERT INTO employees (id, username, password, name, base_salary, user_type) VALUES 
(employees_seq.NEXTVAL, 'emp5', 'emp123', 'David Brown', 31000, 'employee');

INSERT INTO employees (id, username, password, name, base_salary, user_type) VALUES 
(employees_seq.NEXTVAL, 'admin', 'admin123', 'Salary Administrator', 0, 'admin');

-- Insert Sample Attendance
INSERT INTO attendance (id, employee_id, attendance_date, check_in_time, check_out_time, status) VALUES 
(attendance_seq.NEXTVAL, 1, DATE '2024-01-01', '09:00', '17:00', 'Present');

INSERT INTO attendance (id, employee_id, attendance_date, check_in_time, check_out_time, status) VALUES 
(attendance_seq.NEXTVAL, 1, DATE '2024-01-02', '09:15', '17:30', 'Present');

INSERT INTO attendance (id, employee_id, attendance_date, check_in_time, check_out_time, status) VALUES 
(attendance_seq.NEXTVAL, 2, DATE '2024-01-01', '08:45', '17:15', 'Present');

-- Insert Sample Salaries
INSERT INTO salaries (id, employee_id, month_year, base_salary, bonus, deductions, final_salary, status) VALUES 
(salaries_seq.NEXTVAL, 1, '2024-01', 30000, 2000, 500, 31500, 'Pending');

INSERT INTO salaries (id, employee_id, month_year, base_salary, bonus, deductions, final_salary, status) VALUES 
(salaries_seq.NEXTVAL, 2, '2024-01', 32000, 1500, 300, 33200, 'Approved');


