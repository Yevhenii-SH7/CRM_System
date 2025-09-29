<?php

namespace App\Models;

use App\Database\Database;
use PDO;

class Project
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query("
            SELECT p.*, c.name as client_name, u.first_name as created_first_name, u.last_name as created_last_name
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN users u ON p.created_by = u.id
            ORDER BY p.created_at DESC
        ");
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT p.*, c.name as client_name, u.first_name as created_first_name, u.last_name as created_last_name
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO projects (title, description, client_id, created_by, hourly_rate) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['title'],
            $data['description'] ?? null,
            $data['client_id'] ?? null,
            $data['created_by'],
            $data['hourly_rate'] ?? null
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];

        if (isset($data['title'])) {
            $fields[] = "title = ?";
            $values[] = $data['title'];
        }
        
        if (isset($data['description'])) {
            $fields[] = "description = ?";
            $values[] = $data['description'] ?? null;
        }
        
        if (isset($data['client_id'])) {
            $fields[] = "client_id = ?";
            $values[] = $data['client_id'] ?? null;
        }
        
        if (isset($data['hourly_rate'])) {
            $fields[] = "hourly_rate = ?";
            $values[] = $data['hourly_rate'] ?? null;
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = "UPDATE projects SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM projects WHERE id = ?");
        return $stmt->execute([$id]);
    }
}