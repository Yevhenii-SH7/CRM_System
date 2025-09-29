<?php

namespace App\Middleware;

class CorsMiddleware
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function handle(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = explode(',', $this->config['allowed_origins']);

        $isOriginAllowed = in_array($origin, $allowedOrigins) || $this->config['allowed_origins'] === '*';
        
        if ($isOriginAllowed) {
            header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
        }

        header('Access-Control-Allow-Methods: ' . $this->config['allowed_methods']);
        header('Access-Control-Allow-Headers: ' . $this->config['allowed_headers']);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}