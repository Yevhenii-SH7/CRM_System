<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Database connection using Railway MySQL environment variables
    $host = $_ENV['MYSQLHOST'] ?? $_ENV['DB_HOST'] ?? 'localhost';
    $port = $_ENV['MYSQLPORT'] ?? $_ENV['DB_PORT'] ?? '3306';
    $dbname = $_ENV['MYSQLDATABASE'] ?? $_ENV['DB_NAME'] ?? 'railway';
    $username = $_ENV['MYSQLUSER'] ?? $_ENV['DB_USER'] ?? 'root';
    $password = $_ENV['MYSQLPASSWORD'] ?? $_ENV['DB_PASSWORD'] ?? '';
    
    // Only try to connect if we have database credentials
    $pdo = null;
    if ($host && $username) {
        try {
            $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
        } catch (Exception $dbError) {
            // Continue without database connection
            $pdo = null;
        }
    }
    
    $action = $_GET['action'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($action) {
        case 'login':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $email = $input['email'] ?? '';
                $password = $input['password'] ?? '';
                
                if ($email === 'admin@example.com' && $password === 'password') {
                    echo json_encode([
                        'user' => [
                            'id' => 1,
                            'email' => 'admin@example.com',
                            'first_name' => 'Admin',
                            'last_name' => 'User',
                            'role' => 'admin'
                        ],
                        'token' => 'demo-token-' . time()
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['error' => 'Invalid credentials']);
                }
            }
            break;
            
        case 'tasks':
            echo json_encode([]);
            break;
            
        case 'dashboard_summary':
            echo json_encode([
                'total_tasks' => 0,
                'completed_tasks' => 0,
                'active_projects' => 0,
                'total_projects' => 0,
                'overdue_tasks' => 0,
                'total_clients' => 0,
                'total_users' => 1,
                'avg_task_hours' => 0,
                'earnings_month' => 0
            ]);
            break;
            
        case 'recent_tasks':
            echo json_encode([]);
            break;
            
        case 'active_projects':
            echo json_encode([]);
            break;
            
        case 'projects':
            echo json_encode([]);
            break;
            
        case 'clients':
            echo json_encode([]);
            break;
            
        default:
            echo json_encode(['status' => 'API Ready', 'endpoints' => ['login', 'tasks', 'dashboard_summary', 'recent_tasks', 'active_projects', 'projects', 'clients']]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}