<?php
// Start output buffering to catch any unexpected output
ob_start();

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors directly
header('Content-Type: application/json');

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "employee";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    sendResponse("Error", "Database connection failed: " . $conn->connect_error);
}

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse("Error", "Invalid request method");
}

// Get and validate POST data
$required_fields = ['name', 'department', 'salary', 'contact'];
foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        sendResponse("Error", "All fields are required");
    }
}

// Sanitize inputs
$name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
$department = filter_var($_POST['department'], FILTER_SANITIZE_STRING);
$salary = filter_var($_POST['salary'], FILTER_VALIDATE_FLOAT);
$contact = filter_var($_POST['contact'], FILTER_SANITIZE_STRING);

if ($salary === false || $salary < 0) {
    sendResponse("Error", "Invalid salary value");
}

// Prepare and execute SQL
$sql = "INSERT INTO employees (name, department, salary, contact) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    sendResponse("Error", "SQL preparation failed: " . $conn->error);
}

$stmt->bind_param("ssds", $name, $department, $salary, $contact);

if ($stmt->execute()) {
    sendResponse("Success", "Employee added successfully!");
} else {
    sendResponse("Error", "Failed to add employee: " . $stmt->error);
}

// Cleanup
$stmt->close();
$conn->close();
ob_end_flush();

// Response function to ensure consistent JSON output
function sendResponse($status, $message) {
    // Clear any previous output
    ob_clean();
    echo json_encode([
        "status" => $status,
        "message" => $message
    ]);
    exit;
}
?>