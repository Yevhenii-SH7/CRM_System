<?php
// Router for Render deployment
if (file_exists(__DIR__ . '/backend/public/api.php')) {
    require_once __DIR__ . '/backend/public/api.php';
} elseif (file_exists(__DIR__ . '/api.php')) {
    require_once __DIR__ . '/api.php';
} else {
    http_response_code(404);
    echo 'Application not found';
}