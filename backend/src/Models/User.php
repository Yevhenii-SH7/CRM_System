<?php

namespace App\Models;

use App\Database\Database;
use PDO;

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query("SELECT id, email, first_name, last_name, role, created_at, last_login, is_active FROM users ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT id, email, first_name, last_name, role, created_at, last_login, is_active FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO users (email, password_hash, first_name, last_name, role) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['email'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['first_name'],
            $data['last_name'],
            $data['role'] ?? 'user'
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];

        if (isset($data['email'])) {
            $fields[] = "email = ?";
            $values[] = $data['email'];
        }
        
        if (isset($data['first_name'])) {
            $fields[] = "first_name = ?";
            $values[] = $data['first_name'];
        }
        
        if (isset($data['last_name'])) {
            $fields[] = "last_name = ?";
            $values[] = $data['last_name'];
        }
        
        if (isset($data['role'])) {
            $fields[] = "role = ?";
            $values[] = $data['role'];
        }

        if (isset($data['password'])) {
            $fields[] = "password_hash = ?";
            $values[] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        if (empty($fields)) {
            return false;
        }
        $values[] = $id;
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function updateLastLogin(int $id): bool
    {
        $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }
}