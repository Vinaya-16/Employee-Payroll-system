// Sample employee data (In real scenario, this would come from Oracle Apex database)
const employees = [
    { id: 1, username: "emp1", password: "emp123", name: "John Doe", baseSalary: 30000 },
    { id: 2, username: "emp2", password: "emp123", name: "Jane Smith", baseSalary: 32000 },
    { id: 3, username: "emp3", password: "emp123", name: "Mike Johnson", baseSalary: 28000 },
    { id: 4, username: "emp4", password: "emp123", name: "Sarah Wilson", baseSalary: 35000 },
    { id: 5, username: "emp5", password: "emp123", name: "David Brown", baseSalary: 31000 }
];

const admin = { username: "admin", password: "admin123", name: "Salary Administrator" };

// Sample attendance data
const attendanceData = {
    1: [
        { date: "2024-01-01", checkIn: "09:00", checkOut: "17:00", status: "Present" },
        { date: "2024-01-02", checkIn: "09:15", checkOut: "17:30", status: "Present" },
        { date: "2024-01-03", checkIn: "08:45", checkOut: "16:45", status: "Present" }
    ],
    2: [
        { date: "2024-01-01", checkIn: "09:05", checkOut: "17:10", status: "Present" },
        { date: "2024-01-02", checkIn: "08:50", checkOut: "17:00", status: "Present" }
    ],
    // Add data for other employees...
};

// Sample salary data
const salaryData = {
    1: { baseSalary: 30000, bonus: 2000, deductions: 500, finalSalary: 31500, status: "Pending" },
    2: { baseSalary: 32000, bonus: 1500, deductions: 300, finalSalary: 33200, status: "Approved" },
    3: { baseSalary: 28000, bonus: 1000, deductions: 400, finalSalary: 28600, status: "Pending" },
    4: { baseSalary: 35000, bonus: 2500, deductions: 600, finalSalary: 36900, status: "Pending" },
    5: { baseSalary: 31000, bonus: 1800, deductions: 450, finalSalary: 32350, status: "Pending" }
};

// Login functionality
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    let authenticated = false;
    let userData = null;

    if (userType === 'employee') {
        const employee = employees.find(emp => emp.username === username && emp.password === password);
        if (employee) {
            authenticated = true;
            userData = employee;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            window.location.href = 'employee-dashboard.html';
        }
    } else if (userType === 'admin') {
        if (username === admin.username && password === admin.password) {
            authenticated = true;
            userData = admin;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            window.location.href = 'admin-dashboard.html';
        }
    }

    if (!authenticated) {
        document.getElementById('errorMessage').textContent = 'Invalid credentials!';
        document.getElementById('errorMessage').style.display = 'block';
    }
});

// Utility function to calculate salary based on attendance
function calculateSalary(baseSalary, attendanceRecords) {
    const totalWorkingDays = 22; // Standard working days in month
    const presentDays = attendanceRecords.filter(record => record.status === 'Present').length;
    const attendancePercentage = (presentDays / totalWorkingDays) * 100;
    
    let bonus = 0;
    let deductions = 0;
    
    if (attendancePercentage >= 95) {
        bonus = baseSalary * 0.1; // 10% bonus for excellent attendance
    } else if (attendancePercentage < 80) {
        deductions = baseSalary * 0.05; // 5% deduction for poor attendance
    }
    
    const finalSalary = baseSalary + bonus - deductions;
    
    return {
        baseSalary,
        bonus,
        deductions,
        finalSalary,
        attendancePercentage,
        presentDays,
        totalWorkingDays
    };
}