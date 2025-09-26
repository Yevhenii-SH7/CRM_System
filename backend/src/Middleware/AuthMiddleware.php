<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthMiddleware
{
    private array $jwtConfig;

    public function __construct(array $jwtConfig)
    {
        $this->jwtConfig = $jwtConfig;
    }

    public function authenticate(): ?array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token = substr($authHeader, 7);

        try {
            $decoded = JWT::decode($token, new Key($this->jwtConfig['secret'], 'HS256'));
            return (array) $decoded;
        } catch (Exception $e) {
            return null;
        }
    }

    public function requireAuth(): array
    {
        $user = $this->authenticate();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }

        return $user;
    }
}