<?php

// Handle CORS headers properly for all requests
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3009',
    'http://localhost:8080',
    'http://localhost',
    'https://crm-task-planner-front.onrender.com'
];

// Check if origin is allowed and set CORS headers appropriately
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

header('Content-Type: application/json');

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
        putenv(trim($name) . '=' . trim($value));
    }
}

// Try different paths for vendor autoload
$autoloadPaths = [
    __DIR__ . '/../vendor/autoload.php',
    '/var/www/html/vendor/autoload.php',
    __DIR__ . '/vendor/autoload.php'
];

$autoloadFound = false;
foreach ($autoloadPaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $autoloadFound = true;
        break;
    }
}

if (!$autoloadFound) {
    echo json_encode(['error' => 'Dependencies not installed. Please run composer install.']);
    exit;
}

try {
    $config = require_once __DIR__ . '/../config/bootstrap.php';
    
    if (!empty($config['database']['socket'])) {
        $dsn = "mysql:unix_socket={$config['database']['socket']};dbname={$config['database']['name']};charset={$config['database']['charset']}";
    } else {
        $dsn = "mysql:host={$config['database']['host']};port={$config['database']['port']};dbname={$config['database']['name']};charset={$config['database']['charset']}";
    }
    
    $pdo = new PDO(
        $dsn,
        $config['database']['user'],
        $config['database']['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $uri = $_SERVER['REQUEST_URI'];
    $path = parse_url($uri, PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'];
    
    $path = str_replace('/crm_task_planner/api.php', '', $path);
    $path = trim($path, '/');
    
    $action = $_GET['action'] ?? $path;
    
    // Handle root path without action
    if (empty($action)) {
        echo json_encode([
            'message' => 'CRM Task Planner API',
            'version' => '1.0.0',
            'endpoints' => [
                'GET /api.php?action=tasks' => 'Get all tasks',
                'GET /api.php?action=projects' => 'Get all projects',
                'GET /api.php?action=clients' => 'Get all clients',
                'GET /api.php?action=dashboard_summary' => 'Get dashboard metrics'
            ]
        ]);
        exit;
    }
    
    function authenticateUser($pdo) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }
        
        $token = substr($authHeader, 7);
        
        try {
            $jwtSecret = $_ENV['JWT_SECRET'] ?? 'your-super-secret-jwt-key-change-this';
            
            $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($jwtSecret, 'HS256'));
            $payload = (array) $decoded;
            
            $userId = $payload['user_id'] ?? null;
            if (!$userId) {
                return null;
            }
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $user ? $user : null;
        } catch (Exception $e) {
            return null;
        }
    }
    
    function requireAdmin($pdo) {
        $user = authenticateUser($pdo);
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }
        
        return $user;
    }
    
    switch ($action) {
        case 'tasks':
            if ($method === 'GET') {
                $showDeleted = $_GET['deleted'] ?? 'false';
                if ($showDeleted === 'true') {
                    $stmt = $pdo->query("
                        SELECT t.*, ts.name as status_name 
                        FROM tasks t 
                        LEFT JOIN task_statuses ts ON t.status_id = ts.id 
                        WHERE t.deleted_at IS NOT NULL
                        ORDER BY t.deleted_at DESC
                    ");
                } else {
                    $stmt = $pdo->query("
                        SELECT t.*, ts.name as status_name 
                        FROM tasks t 
                        LEFT JOIN task_statuses ts ON t.status_id = ts.id 
                        WHERE t.deleted_at IS NULL
                        ORDER BY t.created_at DESC
                    ");
                }
                $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($tasks);
            } elseif ($method === 'POST') {
                $restore = $_GET['restore'] ?? 'false';
                $input = json_decode(file_get_contents('php://input'), true);
                
                if ($restore === 'true') {
                    $taskId = $input['id'] ?? null;
                    if (!$taskId) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Task ID required for restore']);
                        break;
                    }
                    
                    $stmt = $pdo->prepare("UPDATE tasks SET deleted_at = NULL WHERE id = ?");
                    $stmt->execute([$taskId]);
                    
                    $stmt = $pdo->prepare("
                        SELECT t.*, ts.name as status_name 
                        FROM tasks t 
                        LEFT JOIN task_statuses ts ON t.status_id = ts.id 
                        WHERE t.id = ?
                    ");
                    $stmt->execute([$taskId]);
                    $task = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    echo json_encode(['message' => 'Task restored', 'task' => $task]);
                } else {
                    $stmt = $pdo->prepare("
                        INSERT INTO tasks (title, description, priority, status_id, project_id, assigned_to, due_date, estimated_hours, created_by) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([
                        $input['title'],
                        $input['description'] ?? '',
                        $input['priority'] ?? 'Medium',
                        $input['status_id'] ?? 1,
                        $input['project_id'] ?? null,
                        $input['assigned_to'] ?? null,
                        $input['due_date'] ?? null,
                        $input['estimated_hours'] ?? null,
                        $input['created_by'] ?? 1  // Use provided created_by or default to 1
                    ]);
                    
                    $taskId = $pdo->lastInsertId();
                    $stmt = $pdo->prepare("
                        SELECT t.*, ts.name as status_name 
                        FROM tasks t 
                        LEFT JOIN task_statuses ts ON t.status_id = ts.id 
                        WHERE t.id = ?
                    ");
                    $stmt->execute([$taskId]);
                    $task = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    http_response_code(201);
                    echo json_encode($task);
                }
            } elseif ($method === 'PUT') {
                $taskId = $_GET['id'] ?? null;
                if (!$taskId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Task ID required']);
                    break;
                }
                
                $input = json_decode(file_get_contents('php://input'), true);
                
                $updateFields = [];
                $params = [];
                
                if (array_key_exists('status_id', $input)) {
                    $updateFields[] = 'status_id = ?';
                    $params[] = $input['status_id'];
                }
                if (array_key_exists('title', $input)) {
                    $updateFields[] = 'title = ?';
                    $params[] = $input['title'];
                }
                if (array_key_exists('description', $input)) {
                    $updateFields[] = 'description = ?';
                    $params[] = $input['description'];
                }
                if (array_key_exists('priority', $input)) {
                    $updateFields[] = 'priority = ?';
                    $params[] = $input['priority'];
                }
                if (array_key_exists('due_date', $input)) {
                    $updateFields[] = 'due_date = ?';
                    $params[] = $input['due_date'];
                }
                if (array_key_exists('estimated_hours', $input)) {
                    $updateFields[] = 'estimated_hours = ?';
                    $params[] = $input['estimated_hours'];
                }
                if (array_key_exists('actual_hours', $input)) {
                    $updateFields[] = 'actual_hours = ?';
                    $params[] = $input['actual_hours'];
                }
                if (array_key_exists('assigned_to', $input)) {
                    $updateFields[] = 'assigned_to = ?';
                    $params[] = $input['assigned_to'];
                }
                if (array_key_exists('project_id', $input)) {
                    $updateFields[] = 'project_id = ?';
                    $params[] = $input['project_id'];
                }
                if (array_key_exists('actual_hours', $input)) {
                    $updateFields[] = 'actual_hours = ?';
                    $params[] = $input['actual_hours'];
                }
                
                if (empty($updateFields)) {
                    echo json_encode(['error' => 'No fields to update']);
                    break;
                }
                
                $updateFields[] = 'updated_at = NOW()';
                $params[] = $taskId;
                
                $stmt = $pdo->prepare("
                    UPDATE tasks SET " . implode(', ', $updateFields) . " WHERE id = ?
                ");
                $stmt->execute($params);
                
                $stmt = $pdo->prepare("SELECT t.*, ts.name as status_name FROM tasks t LEFT JOIN task_statuses ts ON t.status_id = ts.id WHERE t.id = ?");
                $stmt->execute([$taskId]);
                $task = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode($task);
            } elseif ($method === 'DELETE') {
                $taskId = $_GET['id'] ?? null;
                $permanent = $_GET['permanent'] ?? 'false';
                
                if (!$taskId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Task ID required']);
                    break;
                }
                
                if ($permanent === 'true') {
                    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
                    $result = $stmt->execute([$taskId]);
                    if ($result) {
                        echo json_encode(['message' => 'Task permanently deleted']);
                    } else {
                        http_response_code(500);
                        echo json_encode(['error' => 'Failed to permanently delete task']);
                    }
                } else {
                    $stmt = $pdo->prepare("UPDATE tasks SET deleted_at = NOW() WHERE id = ?");
                    $result = $stmt->execute([$taskId]);
                    if ($result) {
                        echo json_encode(['message' => 'Task moved to trash']);
                    } else {
                        http_response_code(500);
                        echo json_encode(['error' => 'Failed to delete task']);
                    }
                }
            }
            break;
            
        case 'users':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT id, email, first_name, last_name, role, created_at FROM users");
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($users);
            } elseif ($method === 'PUT') {
                $userId = $_GET['id'] ?? null;
                if (!$userId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID required']);
                    break;
                }
                
                $input = json_decode(file_get_contents('php://input'), true);
                
                $updateFields = [];
                $params = [];
                
                if (isset($input['first_name'])) {
                    $updateFields[] = 'first_name = ?';
                    $params[] = $input['first_name'];
                }
                if (isset($input['last_name'])) {
                    $updateFields[] = 'last_name = ?';
                    $params[] = $input['last_name'];
                }
                if (isset($input['email'])) {
                    $updateFields[] = 'email = ?';
                    $params[] = $input['email'];
                }
                if (isset($input['role'])) {
                    $updateFields[] = 'role = ?';
                    $params[] = $input['role'];
                }
                if (isset($input['password'])) {
                    $updateFields[] = 'password_hash = ?';
                    $params[] = password_hash($input['password'], PASSWORD_DEFAULT);
                }
                
                if (empty($updateFields)) {
                    echo json_encode(['error' => 'No fields to update']);
                    break;
                }
                
                $params[] = $userId;
                $stmt = $pdo->prepare(
                    "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?"
                );
                $stmt->execute($params);
                
                $stmt = $pdo->prepare("SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode($user);
            }
            break;
            
        case 'clients':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM clients ORDER BY created_at DESC");
                $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($clients);
            } elseif ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $pdo->prepare("
                    INSERT INTO clients (name, contact_email, phone, address, created_by) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $input['name'],
                    $input['contact_email'] ?? null,
                    $input['phone'] ?? null,
                    $input['address'] ?? null,
                    $input['created_by'] ?? 1  // Use provided created_by or default to 1
                ]);
                
                $clientId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
                $stmt->execute([$clientId]);
                $client = $stmt->fetch(PDO::FETCH_ASSOC);
                
                http_response_code(201);
                echo json_encode($client);
            } elseif ($method === 'PUT') {
                $clientId = $_GET['id'] ?? null;
                if (!$clientId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Client ID required']);
                    break;
                }
                
                $input = json_decode(file_get_contents('php://input'), true);
                
                $updateFields = [];
                $params = [];
                
                if (isset($input['name'])) {
                    $updateFields[] = 'name = ?';
                    $params[] = $input['name'];
                }
                if (isset($input['contact_email'])) {
                    $updateFields[] = 'contact_email = ?';
                    $params[] = $input['contact_email'];
                }
                if (isset($input['phone'])) {
                    $updateFields[] = 'phone = ?';
                    $params[] = $input['phone'];
                }
                if (isset($input['address'])) {
                    $updateFields[] = 'address = ?';
                    $params[] = $input['address'];
                }
                
                if (empty($updateFields)) {
                    echo json_encode(['error' => 'No fields to update']);
                    break;
                }
                
                $params[] = $clientId;
                $stmt = $pdo->prepare(
                    "UPDATE clients SET " . implode(', ', $updateFields) . " WHERE id = ?"
                );
                $stmt->execute($params);
                
                $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
                $stmt->execute([$clientId]);
                $client = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode($client);
            } elseif ($method === 'DELETE') {
                $clientId = $_GET['id'] ?? null;
                if (!$clientId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Client ID required']);
                    break;
                }
                
                $stmt = $pdo->prepare("DELETE FROM clients WHERE id = ?");
                $stmt->execute([$clientId]);
                
                echo json_encode(['message' => 'Client deleted successfully']);
            }
            break;
            
        case 'projects':
            if ($method === 'GET') {
                $stmt = $pdo->query("
                    SELECT p.*, c.name as client_name 
                    FROM projects p 
                    LEFT JOIN clients c ON p.client_id = c.id 
                    ORDER BY p.created_at DESC
                ");
                $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($projects);
            } elseif ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $pdo->prepare("
                    INSERT INTO projects (title, description, status, start_date, end_date, priority, client_id, hourly_rate) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $input['title'],
                    $input['description'] ?? '',
                    $input['status'] ?? 'Active',
                    $input['start_date'] ?? null,
                    $input['end_date'] ?? null,
                    $input['priority'] ?? 'Medium',
                    $input['client_id'] ?? null,
                    $input['hourly_rate'] ?? null
                ]);
                
                $projectId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("
                    SELECT p.*, c.name as client_name 
                    FROM projects p 
                    LEFT JOIN clients c ON p.client_id = c.id 
                    WHERE p.id = ?
                ");
                $stmt->execute([$projectId]);
                $project = $stmt->fetch(PDO::FETCH_ASSOC);
                
                http_response_code(201);
                echo json_encode($project);
            } elseif ($method === 'PUT') {
                $projectId = $_GET['id'] ?? null;
                if (!$projectId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Project ID required']);
                    break;
                }
                
                $input = json_decode(file_get_contents('php://input'), true);
                
                $updateFields = [];
                $params = [];
                
                foreach (['title', 'description', 'status', 'start_date', 'end_date', 'priority', 'client_id', 'hourly_rate'] as $field) {
                    if (isset($input[$field])) {
                        $updateFields[] = "$field = ?";
                        $params[] = $input[$field];
                    }
                }
                
                if (empty($updateFields)) {
                    echo json_encode(['error' => 'No fields to update']);
                    break;
                }
                
                $params[] = $projectId;
                $stmt = $pdo->prepare(
                    "UPDATE projects SET " . implode(', ', $updateFields) . " WHERE id = ?"
                );
                $stmt->execute($params);
                
                $stmt = $pdo->prepare("
                    SELECT p.*, c.name as client_name 
                    FROM projects p 
                    LEFT JOIN clients c ON p.client_id = c.id 
                    WHERE p.id = ?
                ");
                $stmt->execute([$projectId]);
                $project = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode($project);
            } elseif ($method === 'DELETE') {
                $projectId = $_GET['id'] ?? null;
                if (!$projectId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Project ID required']);
                    break;
                }
                
                $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
                $stmt->execute([$projectId]);
                
                echo json_encode(['message' => 'Project deleted successfully']);
            }
            break;
            
        case 'login':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $email = $input['email'] ?? '';
                $password = $input['password'] ?? '';
                
                if (empty($email) || empty($password)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Email and password required']);
                    break;
                }
                
                $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
                $stmt->execute([$email]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user && password_verify($password, $user['password_hash'])) {
                    $token = base64_encode($user['id'] . ':' . time());
                    echo json_encode([
                        'user' => [
                            'id' => $user['id'],
                            'email' => $user['email'],
                            'first_name' => $user['first_name'],
                            'last_name' => $user['last_name'],
                            'role' => $user['role']
                        ],
                        'token' => $token
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['error' => 'Invalid credentials']);
                }
            }
            break;
            
        case 'register':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $email = $input['email'] ?? '';
                $password = $input['password'] ?? '';
                $firstName = $input['first_name'] ?? '';
                $lastName = $input['last_name'] ?? '';
                $role = $input['role'] ?? 'user';
                
                if (empty($email) || empty($password) || empty($firstName) || empty($lastName)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'All fields required']);
                    break;
                }
                
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    http_response_code(409);
                    echo json_encode(['error' => 'User already exists']);
                    break;
                }
                
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("
                    INSERT INTO users (email, password_hash, first_name, last_name, role) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([$email, $hashedPassword, $firstName, $lastName, $role]);
                
                $userId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT id, email, first_name, last_name, role FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                http_response_code(201);
                echo json_encode($user);
            }
            break;
            
        case 'dashboard_summary':
            if ($method === 'GET') {
                $summary = [];
                
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM tasks WHERE deleted_at IS NULL");
                $summary['total_tasks'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM tasks WHERE status_id = 3 AND deleted_at IS NULL");
                $summary['completed_tasks'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM projects WHERE status = 'Active'");
                $summary['active_projects'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM projects");
                $summary['total_projects'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM tasks WHERE due_date < NOW() AND status_id != 3 AND deleted_at IS NULL");
                $summary['overdue_tasks'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                // Add new metrics
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM clients");
                $summary['total_clients'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
                $summary['total_users'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                $stmt = $pdo->query("SELECT AVG(actual_hours) as avg_hours FROM tasks WHERE actual_hours IS NOT NULL AND deleted_at IS NULL");
                $avgHoursResult = $stmt->fetch(PDO::FETCH_ASSOC);
                $summary['avg_task_hours'] = round((float)($avgHoursResult['avg_hours'] ?? 0), 2);
                
                $currentMonth = date('m');
                $currentYear = date('Y');
                $stmt = $pdo->prepare("
                    SELECT 
                        SUM(t.actual_hours * p.hourly_rate) as earnings
                    FROM tasks t
                    LEFT JOIN projects p ON t.project_id = p.id
                    WHERE YEAR(t.due_date) = ? AND MONTH(t.due_date) = ? 
                    AND t.actual_hours IS NOT NULL
                    AND t.status_id = 3
                    AND t.deleted_at IS NULL
                    AND p.hourly_rate IS NOT NULL
                ");
                $stmt->execute([$currentYear, $currentMonth]);
                $earningsResult = $stmt->fetch(PDO::FETCH_ASSOC);
                $summary['earnings_month'] = (float)($earningsResult['earnings'] ?? 0);
                
                echo json_encode($summary);
            }
            break;
            
        case 'recent_tasks':
            if ($method === 'GET') {
                $stmt = $pdo->query("
                    SELECT t.*, ts.name as status, p.title as project_title
                    FROM tasks t
                    LEFT JOIN task_statuses ts ON t.status_id = ts.id
                    LEFT JOIN projects p ON t.project_id = p.id
                    WHERE t.deleted_at IS NULL
                    ORDER BY t.created_at DESC
                    LIMIT 5
                ");
                $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($tasks);
            }
            break;
            
        case 'active_projects':
            if ($method === 'GET') {
                $stmt = $pdo->query("
                    SELECT 
                      p.*, 
                      c.name as client_name,
                      (SELECT COUNT(*) FROM tasks t1 WHERE t1.project_id = p.id AND t1.deleted_at IS NULL) as total_tasks,
                      (SELECT COUNT(*) FROM tasks t2 WHERE t2.project_id = p.id AND t2.status_id = 3 AND t2.deleted_at IS NULL) as completed_tasks
                    FROM projects p
                    LEFT JOIN clients c ON p.client_id = c.id
                    WHERE p.status = 'Active'
                    ORDER BY p.created_at DESC
                    LIMIT 5
                ");
                $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($projects);
            }
            break;
            
        case 'dashboard_charts':
            if ($method === 'GET') {
                $charts = [];
                
                $stmt = $pdo->query("
                    SELECT ts.name as status, COUNT(t.id) as count
                    FROM task_statuses ts
                    LEFT JOIN tasks t ON ts.id = t.status_id AND t.deleted_at IS NULL
                    GROUP BY ts.id, ts.name
                ");
                $charts['tasks_by_status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $stmt = $pdo->query("
                    SELECT p.title as project, COUNT(t.id) as count
                    FROM projects p
                    LEFT JOIN tasks t ON p.id = t.project_id AND t.deleted_at IS NULL
                    GROUP BY p.id, p.title
                    ORDER BY count DESC
                ");
                $charts['tasks_by_project'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $stmt = $pdo->prepare("
                    SELECT id, title, due_date
                    FROM tasks
                    WHERE due_date >= CURDATE() AND due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                    AND deleted_at IS NULL
                    ORDER BY due_date ASC
                    LIMIT 5
                ");
                $stmt->execute();
                $charts['upcoming_deadlines'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($charts);
            }
            break;
            
        case 'monthly_earnings':
            if ($method === 'GET') {
                $year = $_GET['year'] ?? date('Y');
                $month = $_GET['month'] ?? date('m');
                
                $stmt = $pdo->prepare("
                    SELECT 
                        DATE(t.due_date) as date,
                        SUM(t.actual_hours * p.hourly_rate) as earnings
                    FROM tasks t
                    LEFT JOIN projects p ON t.project_id = p.id
                    WHERE YEAR(t.due_date) = ? AND MONTH(t.due_date) = ? 
                    AND t.actual_hours IS NOT NULL
                    AND t.deleted_at IS NULL
                    AND p.hourly_rate IS NOT NULL
                    GROUP BY DATE(t.due_date)
                    ORDER BY date
                ");
                $stmt->execute([$year, $month]);
                $earnings = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($earnings as &$earning) {
                    $earning['earnings'] = (float)($earning['earnings'] ?? 0);
                }
                
                echo json_encode($earnings);
            }
            break;
            
        case '':
        case null:
            echo json_encode([
                'status' => 'API Ready',
                'endpoints' => ['login', 'register', 'tasks', 'dashboard_summary', 'recent_tasks', 'active_projects', 'projects', 'clients']
            ]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}