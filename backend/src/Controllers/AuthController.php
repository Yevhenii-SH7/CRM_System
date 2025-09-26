<?php

namespace App\Controllers;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController
{
    private User $userModel;
    private array $jwtConfig;

    public function __construct(array $jwtConfig)
    {
        $this->userModel = new User();
        $this->jwtConfig = $jwtConfig;
    }

    public function register(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['email']) || 
            !isset($input['password']) || 
            !isset($input['first_name']) || 
            !isset($input['last_name']) ||
            !filter_var($input['email'], FILTER_VALIDATE_EMAIL) ||
            strlen($input['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
            return;
        }

        if ($this->userModel->findByEmail($input['email'])) {
            http_response_code(409);
            echo json_encode(['error' => 'User already exists']);
            return;
        }

        try {
            $userId = $this->userModel->create($input);
            $user = $this->userModel->findById($userId);

            echo json_encode([
                'message' => 'User registered successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed']);
        }
    }

    public function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }

        $user = $this->userModel->findByEmail($input['email']);

        if (!$user || !$this->userModel->verifyPassword($input['password'], $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        if (!$user['is_active']) {
            http_response_code(403);
            echo json_encode(['error' => 'Account is disabled']);
            return;
        }

        $this->userModel->updateLastLogin($user['id']);

        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + $this->jwtConfig['expiration']
        ];

        $token = JWT::encode($payload, $this->jwtConfig['secret'], 'HS256');

        unset($user['password_hash']);

        echo json_encode([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }
}