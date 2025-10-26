EMPLOYEE MANAGEMENT SYSTEM - SETUP INSTRUCTIONS

1. FILE STRUCTURE:
   - Save all files in the same folder
   - Required files: index.html, styles.css, script.js, employee-dashboard.html, admin-dashboard.html

2. LOGIN CREDENTIALS:

   EMPLOYEES:
   - Username: emp1, Password: emp123
   - Username: emp2, Password: emp123
   - Username: emp3, Password: emp123
   - Username: emp4, Password: emp123
   - Username: emp5, Password: emp123

   ADMIN:
   - Username: admin, Password: admin123

3. FEATURES:

   EMPLOYEE DASHBOARD:
   - View monthly attendance schedule
   - Check check-in/check-out times
   - View salary information
   - See attendance percentage

   ADMIN DASHBOARD:
   - View all employees' salary data
   - Adjust bonus and deductions
   - Approve salaries
   - Real-time salary calculation

4. ORACLE APEX INTEGRATION:
   To connect with Oracle Apex database, replace the sample data in script.js with actual API calls to your Oracle Apex REST endpoints.

5. DATABASE TABLES SUGGESTION:
   - Employees: id, username, password, name, base_salary
   - Attendance: id, employee_id, date, check_in, check_out, status
   - Salaries: id, employee_id, month_year, base_salary, bonus, deductions, final_salary, status

6. RUNNING THE APPLICATION:
   - Open index.html in a web browser
   - Use the provided credentials to login
   - Navigate between employee and admin dashboards based on user type