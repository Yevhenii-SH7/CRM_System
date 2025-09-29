<?php

require_once __DIR__ . '/../vendor/autoload.php';

date_default_timezone_set('UTC');

error_reporting(E_ALL);
ini_set('display_errors', 1);

if (file_exists(__DIR__ . '/../.env.local')) {
  $lines = file(__DIR__ . '/../.env.local', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  
  foreach ($lines as $line) {
    if (empty(trim($line)) || strpos(trim($line), '#') === 0) {
      continue;
    }
    
    if (strpos($line, '=') === false) {
      continue;
    }
    
    [$name, $value] = explode('=', $line, 2);
    $name = trim($name);
    $value = trim($value);
    
    $_ENV[$name] = $value;
    putenv("$name=$value");
  }
}

// Database SSL configuration for MySQL
$sslMode = $_ENV['DB_SSL_MODE'] ?? 'PREFERRED';
$pdoOptions = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

// Add SSL options based on mode
if ($sslMode === 'REQUIRED') {
    $pdoOptions[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
    // Try multiple CA bundle paths for compatibility
    $caPaths = [
        '/etc/ssl/certs/ca-certificates.crt', // Debian/Ubuntu
        '/etc/ssl/ca-bundle.pem',             // RedHat/CentOS
        '/etc/pki/tls/certs/ca-bundle.crt',   // Older RedHat
    ];
    
    foreach ($caPaths as $caPath) {
        if (file_exists($caPath)) {
            $pdoOptions[PDO::MYSQL_ATTR_SSL_CA] = $caPath;
            break;
        }
    }
} elseif ($sslMode === 'PREFERRED') {
    // SSL is preferred but not required - let the driver decide
    $pdoOptions[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
}

return [
  'database' => [
    'host' => $_ENV['MYSQLHOST'] ?? $_ENV['DB_HOST'] ?? 'localhost',
    'port' => (int) ($_ENV['MYSQLPORT'] ?? $_ENV['DB_PORT'] ?? 3306),
    'name' => $_ENV['MYSQLDATABASE'] ?? $_ENV['DB_NAME'] ?? 'crm_db',
    'user' => $_ENV['MYSQLUSER'] ?? $_ENV['DB_USER'] ?? 'root',
    'password' => $_ENV['MYSQLPASSWORD'] ?? $_ENV['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4',
    'socket' => $_ENV['DB_SOCKET'] ?? null,
    'ssl_mode' => $sslMode,
    'options' => $pdoOptions,
  ],
  'jwt' => [
    'secret' => $_ENV['JWT_SECRET'] ?? 'your-super-secret-jwt-key-change-this',
    'expiration' => (int) ($_ENV['JWT_EXPIRATION'] ?? 86400),
  ],
  'cors' => [
    'allowed_origins' => $_ENV['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:3000,http://localhost:3007',
    'allowed_methods' => 'GET,POST,PUT,DELETE,OPTIONS',
    'allowed_headers' => 'Content-Type,Authorization,X-Requested-With',
  ],
];