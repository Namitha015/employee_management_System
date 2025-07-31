let employees = [
    { id: 1, name: "John Doe", department: "IT", salary: 75000, contact: "123-456-7890" },
    { id: 2, name: "Jane Smith", department: "HR", salary: 65000, contact: "987-654-3210" }
];
let sortDirection = {};
let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    if (!localStorage.getItem("isLoggedIn")) {
        window.location.href = "login.html";
        return;
    }

    loadTable();
    document.getElementById("employeeForm").addEventListener("submit", addEmployee);
    document.getElementById("clearBtn").addEventListener("click", clearForm);
    document.getElementById("search").addEventListener("input", searchEmployees);
    document.getElementById("exportBtn").addEventListener("click", exportToCSV);
    document.querySelectorAll("th[data-sort]").forEach(th => {
        th.addEventListener("click", () => sortTable(th.dataset.sort));
    });
});

function loadTable(data = employees) {
    const tbody = document.getElementById("employeeTableBody");
    tbody.innerHTML = "";
    data.forEach(emp => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.salary}</td>
            <td>${emp.contact}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editEmployee(${emp.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteEmployee(${emp.id})">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    updateStatus(data.length);
}

function addEmployee(e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const department = document.getElementById("department").value;
    const salary = parseFloat(document.getElementById("salary").value);
    const contact = document.getElementById("contact").value;

    if (editingId) {
        employees = employees.map(emp => 
            emp.id === editingId ? { id: emp.id, name, department, salary, contact } : emp
        );
        editingId = null;
        document.getElementById("addBtn").style.display = "block";
        document.getElementById("updateBtn").style.display = "none";
        setLastAction("Updated employee");
    } else {
        const id = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        employees.push({ id, name, department, salary, contact });
        setLastAction("Added employee");
    }

    loadTable();
    clearForm();
}

function editEmployee(id) {
    const emp = employees.find(e => e.id === id);
    document.getElementById("employeeId").value = emp.id;
    document.getElementById("name").value = emp.name;
    document.getElementById("department").value = emp.department;
    document.getElementById("salary").value = emp.salary;
    document.getElementById("contact").value = emp.contact;

    editingId = id;
    document.getElementById("addBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "block";
}

function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete this employee?")) {
        employees = employees.filter(e => e.id !== id);
        loadTable();
        setLastAction("Deleted employee");
    }
}

function clearForm() {
    document.getElementById("employeeForm").reset();
    editingId = null;
    document.getElementById("addBtn").style.display = "block";
    document.getElementById("updateBtn").style.display = "none";
}

function searchEmployees() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const filtered = employees.filter(emp => emp.name.toLowerCase().includes(searchTerm));
    loadTable(filtered);
}

function sortTable(column) {
    sortDirection[column] = !sortDirection[column];
    const sorted = [...employees].sort((a, b) => {
        const aValue = typeof a[column] === "string" ? a[column].toLowerCase() : a[column];
        const bValue = typeof b[column] === "string" ? b[column].toLowerCase() : b[column];
        return sortDirection[column] ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
    loadTable(sorted);
}

function exportToCSV() {
    const csv = [
        ["ID", "Name", "Department", "Salary", "Contact"],
        ...employees.map(emp => [emp.id, emp.name, emp.department, emp.salary, emp.contact])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    setLastAction("Exported to CSV");
}

function updateStatus(count) {
    document.getElementById("totalEmployees").textContent = `Total Employees: ${count}`;
}

function setLastAction(action) {
    document.getElementById("lastAction").textContent = `Last Action: ${action}`;
}