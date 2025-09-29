<?php

namespace App\Controllers;

use App\Models\User;

class UserController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function index(): void
    {
        $users = $this->userModel->findAll();
        echo json_encode($users);
    }

    public function show(int $id): void
    {
        $user = $this->userModel->findById($id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        echo json_encode($user);
    }

    public function store(array $currentUser): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$this->validateInput($input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
            return;
        }

        try {
            $userId = $this->userModel->create($input);
            $user = $this->userModel->findById($userId);

            http_response_code(201);
            echo json_encode($user);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
    }

    public function update(int $id, array $currentUser): void
    {
        $user = $this->userModel->findById($id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        if ($currentUser['role'] !== 'admin' && $currentUser['user_id'] !== $id) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $this->userModel->update($id, $input);
            $updatedUser = $this->userModel->findById($id);

            echo json_encode($updatedUser);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update user']);
        }
    }

    public function destroy(int $id, array $currentUser): void
    {
        if ($currentUser['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }

        $user = $this->userModel->findById($id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        try {
            $this->userModel->delete($id);
            echo json_encode(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete user']);
        }
    }

    private function validateInput(array $input): bool
    {
        return isset($input['email']) && 
               isset($input['first_name']) && 
               isset($input['last_name']) &&
               filter_var($input['email'], FILTER_VALIDATE_EMAIL);
    }
}