<?php
echo json_encode([
    'message' => 'CRM API Server is running',
    'version' => '1.0.0',
    'endpoints' => [
        'GET /api.php' => 'API status',
        'POST /api.php?action=login' => 'User login',
        'GET /api.php?action=dashboard_summary' => 'Dashboard summary',
        'GET /api.php?action=tasks' => 'Get tasks',
        'GET /api.php?action=projects' => 'Get projects',
        'GET /api.php?action=clients' => 'Get clients'
    ]
]);