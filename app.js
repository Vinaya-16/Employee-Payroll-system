// Global variables
let currentPayroll = null;

// Initialize dashboard
async function initDashboard() {
    console.log('Initializing dashboard...');
    await loadStatistics();
    setupEventListeners();
    console.log('Dashboard ready!');
}

// Load statistics
async function loadStatistics() {
    try {
        console.log('Loading statistics...');
        const response = await fetch('/api/statistics');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        console.log('Statistics loaded:', stats);
        
        document.getElementById('totalEmployees').textContent = stats.totalEmployees;
        document.getElementById('totalNotifications').textContent = stats.pendingNotifications;
        document.getElementById('monthPayroll').textContent = '$' + stats.totalPayroll.toLocaleString();
        document.getElementById('totalDepartments').textContent = stats.totalDepartments;
        
        await loadNotifications();
        await loadAuditLogs();
    } catch (error) {
        console.error('Error loading statistics:', error);
        showMessage('Error loading data. Make sure server is running.', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Employee search
    const searchInput = document.getElementById('searchEmployee');
    searchInput.addEventListener('input', debounce(async (event) => {
        await searchEmployees(event.target.value);
    }, 300));
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search employees
async function searchEmployees(query) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (!query.trim()) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}`);
        const employees = await response.json();
        
        if (employees.length === 0) {
            resultsDiv.innerHTML = '<div class="employee-item text-muted">No employees found</div>';
        } else {
            resultsDiv.innerHTML = employees.map(emp => `
                <div class="employee-item" onclick="selectEmployee(${emp.id}, '${emp.name.replace(/'/g, "\\'")}')">
                    <strong>${emp.name}</strong> (ID: ${emp.id})<br>
                    <small>${emp.department} • ${emp.location} • $${emp.salary}</small>
                </div>
            `).join('');
        }
        resultsDiv.style.display = 'block';
    } catch (error) {
        console.error('Error searching employees:', error);
    }
}

// Select employee from search results
function selectEmployee(id, name) {
    document.getElementById('empId').value = id;
    document.getElementById('empName').value = name;
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchEmployee').value = '';
}

// Add new employee
async function addEmployee() {
    const name = document.getElementById('newEmpName').value;
    const salary = document.getElementById('newEmpSalary').value;
    const department = document.getElementById('newEmpDept').value;
    const location = document.getElementById('newEmpLocation').value;
    
    console.log('Adding employee:', { name, salary, department, location });
    
    if (!name || !salary || !department || !location) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, salary, location, department })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Employee added successfully:', result);
            
            // Clear form
            document.getElementById('newEmpName').value = '';
            document.getElementById('newEmpSalary').value = '';
            document.getElementById('newEmpDept').value = '';
            document.getElementById('newEmpLocation').value = '';
            
            // Refresh data
            await loadStatistics();
            showMessage('Employee added successfully!', 'success');
        } else {
            const errorText = await response.text();
            throw new Error(`Server error: ${errorText}`);
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        showMessage('Error adding employee: ' + error.message, 'error');
    }
}

// Process salary
async function processSalary() {
    const empId = document.getElementById('empId').value;
    const monthYear = document.getElementById('monthYear').value;
    
    if (!empId) {
        alert('Please select an employee from search results');
        return;
    }
    
    if (!monthYear) {
        alert('Please select month and year');
        return;
    }
    
    try {
        const response = await fetch('/api/process-salary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ empId, monthYear })
        });
        
        if (response.ok) {
            const result = await response.json();
            currentPayroll = result;
            displaySalaryResult(result);
            await loadStatistics();
            showMessage('Salary processed successfully!', 'success');
        } else {
            throw new Error('Failed to process salary');
        }
    } catch (error) {
        console.error('Error processing salary:', error);
        showMessage('Error processing salary', 'error');
    }
}

// Display salary result
function displaySalaryResult(payroll) {
    const resultDiv = document.getElementById('salaryResult');
    resultDiv.innerHTML = `
        <h4>💰 Salary Processing Result</h4>
        <div class="row">
            <div class="col-md-6">
                <p><strong>Employee:</strong> ${payroll.employeeName}</p>
                <p><strong>Period:</strong> ${payroll.monthYear}</p>
                <p><strong>Base Salary:</strong> $${payroll.baseSalary.toLocaleString()}</p>
                <p><strong>Working Days:</strong> ${payroll.workingDays}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Overtime:</strong> ${payroll.overtimeHours} hrs ($${payroll.overtimePay.toLocaleString()})</p>
                <p><strong>Bonus:</strong> $${payroll.bonus.toLocaleString()}</p>
                <p><strong>Deductions:</strong> $${payroll.deductions.toLocaleString()}</p>
                <hr>
                <p class="h5"><strong>Net Salary:</strong> $${payroll.netSalary.toLocaleString()}</p>
            </div>
        </div>
        <div class="mt-3">
            <button onclick="commitPayroll(${payroll.id})" class="btn btn-warning">✅ Commit Payroll (Make Final)</button>
            <small class="text-muted ms-2">Once committed, this cannot be changed</small>
        </div>
    `;
    resultDiv.style.display = 'block';
}

// Commit payroll (make it unchangeable)
async function commitPayroll(payrollId) {
    if (!confirm('Are you sure you want to commit this payroll? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/commit-payroll/${payrollId}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            document.getElementById('salaryResult').style.display = 'none';
            document.getElementById('empId').value = '';
            document.getElementById('empName').value = '';
            document.getElementById('monthYear').value = '';
            currentPayroll = null;
            await loadStatistics();
            showMessage('Payroll committed successfully!', 'success');
        } else {
            throw new Error('Failed to commit payroll');
        }
    } catch (error) {
        console.error('Error committing payroll:', error);
        showMessage('Error committing payroll', 'error');
    }
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications');
        const notifications = await response.json();
        
        const notifList = document.getElementById('notifList');
        notifList.innerHTML = '';
        
        if (notifications.length === 0) {
            notifList.innerHTML = '<div class="text-muted text-center py-3">No pending actions</div>';
            return;
        }
        
        notifications.forEach(notif => {
            const notifDiv = document.createElement('div');
            notifDiv.className = `notification-item notification-${notif.type} ${notif.committed ? 'notification-committed' : ''}`;
            notifDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div style="flex: 1;">
                        ${notif.committed ? '<span class="committed-badge">COMMITTED</span>' : ''}
                        <strong>${notif.date}</strong><br>
                        ${notif.message}
                    </div>
                    ${!notif.committed ? `
                        <button class="btn btn-sm btn-outline-success ms-2" onclick="commitNotification(${notif.id})">
                            ✓
                        </button>
                    ` : ''}
                </div>
            `;
            notifList.appendChild(notifDiv);
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Commit notification
async function commitNotification(notifId) {
    try {
        const response = await fetch(`/api/commit-notification/${notifId}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            await loadStatistics();
            showMessage('Action marked as completed', 'success');
        } else {
            throw new Error('Failed to commit notification');
        }
    } catch (error) {
        console.error('Error committing notification:', error);
        showMessage('Error completing action', 'error');
    }
}

// Load audit logs
async function loadAuditLogs() {
    try {
        const response = await fetch('/api/audit-logs');
        const logs = await response.json();
        
        const auditTable = document.getElementById('auditTable');
        auditTable.innerHTML = '';
        
        logs.slice(0, 10).forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge bg-primary">${log.action.replace('_', ' ')}</span></td>
                <td><small>${log.details}</small></td>
                <td><small>${new Date(log.timestamp).toLocaleString()}</small></td>
            `;
            auditTable.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading audit logs:', error);
    }
}

// Refresh all data
async function refreshAll() {
    await loadStatistics();
    showMessage('Data refreshed!', 'info');
}

// Show temporary message
function showMessage(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert.position-fixed');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);