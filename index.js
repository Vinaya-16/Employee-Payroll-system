// --- Simulated Database (In a real application, this is on a server) ---
const employeeData = {
    "EMP001": { name: "Alex Johnson", monthlyBase: 4000 },
    "EMP002": { name: "Maria Garcia", monthlyBase: 5500 },
    "EMP003": { name: "Ben Carter", monthlyBase: 3000 },
};

let currentEmployee = null;

// --- Helper for Currency Formatting ---
function formatCurrency(amount) {
    return parseFloat(amount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
}

// --- Step 1: Handle ID Validation and Grant Access (Simulation) ---
function validateAndGrantAccess() {
    const loginID = document.getElementById('loginID').value.toUpperCase().trim();
    const employee = employeeData[loginID];
    const loginScreen = document.getElementById('loginScreen');
    let errorMessage = document.getElementById('loginError');

    // Create the error message element if it doesn't exist
    if (!errorMessage) {
        errorMessage = document.createElement('p');
        errorMessage.id = 'loginError';
        errorMessage.className = 'error-message';
        loginScreen.appendChild(errorMessage);
    }
    
    // Clear previous errors
    errorMessage.textContent = '';
    
    // Check if the ID exists in our simulated database
    if (!employee) {
        errorMessage.textContent = "Access denied: Employee ID not found. Use a valid test ID (EMP001, EMP002, or EMP003).";
        return;
    }

    // Access Granted
    currentEmployee = { id: loginID, name: employee.name, base: employee.monthlyBase };
    
    // Update welcome message
    document.getElementById('welcomeMsg').textContent = `Welcome, ${currentEmployee.name}!`;
    
    // Hide access screen and show dashboard with a transition
    loginScreen.classList.add('hidden');
    setTimeout(() => {
        document.getElementById('dashboard').classList.remove('hidden');
        loginScreen.style.display = 'none'; // Fully remove the login card after transition
    }, 500); 
}

// --- Step 2: Calculate Salary & Generate Receipt ---
function calculateSalary() {
    if (!currentEmployee) {
        alert("Error: Please validate your ID and gain access first.");
        return;
    }

    // 1. Get user inputs from the dashboard
    const bonus = parseFloat(document.getElementById('bonusAmount').value) || 0;
    const holidays = parseInt(document.getElementById('holidaysTaken').value) || 0;
    
    // Prevent negative inputs
    if (bonus < 0 || holidays < 0) {
        alert("Please enter non-negative values for all inputs.");
        return;
    }
    
    // --- 2. Calculation Logic ---
    const baseSalary = currentEmployee.base;
    
    // Holiday Deduction: Calculated as 0.5x Base Salary divided by 22 working days
    const workingDays = 22;
    const dailyRate = baseSalary / workingDays;
    const deductionRate = 0.5; 
    
    const holidayDeduction = holidays * dailyRate * deductionRate;
    
    // Final Calculation: Net Pay = Base + Bonus - Deductions
    const finalSalary = baseSalary + bonus - holidayDeduction;

    // --- 3. Update Receipt UI ---
    document.getElementById('receiptName').textContent = currentEmployee.name;
    document.getElementById('receiptID').textContent = currentEmployee.id;
    
    document.getElementById('baseSalary').textContent = formatCurrency(baseSalary);
    document.getElementById('bonusAdded').textContent = formatCurrency(bonus);
    document.getElementById('holidayDeduction').textContent = formatCurrency(holidayDeduction);
    document.getElementById('finalSalary').textContent = formatCurrency(finalSalary);

    // Show the receipt section with a transition
    document.getElementById('receiptSection').classList.remove('hidden');
}

// Map the button click to the new function name
document.querySelector('#loginScreen button').onclick = validateAndGrantAccess;