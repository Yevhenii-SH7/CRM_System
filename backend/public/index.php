<?php

// Handle CORS headers properly for all requests
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3009',
    'http://localhost:8080',
    'http://localhost'
];

// Check if origin is allowed
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Check if the request is for the root path with action parameter
// This is how the frontend is making requests: http://localhost:8080/?action=recent_tasks
$uri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($uri);
$path = $parsedUrl['path'] ?? '';

// If this is a request to the root path with an action parameter, route to api.php
if (($path === '/' || $path === '') && isset($_GET['action'])) {
    // Include the api.php file to handle the request
    require_once __DIR__ . '/api.php';
    exit(0);
}

// If this is a request to the root path without action, show API info
if ($path === '/' || $path === '') {
    header('Content-Type: application/json');
    echo json_encode([
        'message' => 'CRM Task Planner API',
        'version' => '1.0.0',
        'status' => 'Ready',
        'endpoints' => [
            'GET /?action=tasks' => 'Get all tasks',
            'GET /?action=projects' => 'Get all projects', 
            'GET /?action=clients' => 'Get all clients',
            'GET /?action=dashboard_summary' => 'Get dashboard metrics',
            'POST /?action=login' => 'User login',
            'POST /?action=register' => 'User registration'
        ]
    ]);
    exit(0);
}

try {
    $config = require_once __DIR__ . '/../config/bootstrap.php';
    
    // Database connection using configuration
    $dsn = "mysql:unix_socket={$config['database']['socket']};dbname={$config['database']['name']};charset={$config['database']['charset']}";
    if (empty($config['database']['socket'])) {
        $dsn = "mysql:host={$config['database']['host']};port={$config['database']['port']};dbname={$config['database']['name']};charset={$config['database']['charset']}";
    }
    
    $pdo = new PDO(
        $dsn,
        $config['database']['user'],
        $config['database']['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $container = [
        'pdo' => $pdo,
        'config' => $config
    ];
    
    // Make container available globally
    $GLOBALS['container'] = $container;
    
    $router = new App\Routes\Router($config['jwt'], $config['cors']);
    $router->handle();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}