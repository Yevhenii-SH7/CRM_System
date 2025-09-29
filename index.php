<?php
// Simple router for Railway deployment
$request = $_SERVER['REQUEST_URI'];

// Remove query string
$path = parse_url($request, PHP_URL_PATH);

// Route API requests to backend
if (strpos($path, '/api.php') !== false) {
    require_once 'backend/public/api.php';
} else {
    // Default response
    echo json_encode(['message' => 'CRM Task Planner API', 'status' => 'running']);
}
?>