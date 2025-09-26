<?php

namespace App\Models;

use App\Database\Database;
use PDO;

class Task
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findAll(array $filters = []): array
    {
        $sql = "
            SELECT t.*, ts.name as status_name, p.title as project_title, 
                   u1.first_name as assigned_first_name, u1.last_name as assigned_last_name,
                   u2.first_name as created_first_name, u2.last_name as created_last_name
            FROM tasks t
            LEFT JOIN task_statuses ts ON t.status_id = ts.id
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
        ";

        $conditions = [];
        $params = [];

        if (!empty($filters['status_id'])) {
            $conditions[] = "t.status_id = ?";
            $params[] = $filters['status_id'];
        }

        if (!empty($filters['project_id'])) {
            $conditions[] = "t.project_id = ?";
            $params[] = $filters['project_id'];
        }

        if (!empty($filters['assigned_to'])) {
            $conditions[] = "t.assigned_to = ?";
            $params[] = $filters['assigned_to'];
        }

        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }

        $sql .= " ORDER BY t.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT t.*, ts.name as status_name, p.title as project_title,
                   u1.first_name as assigned_first_name, u1.last_name as assigned_last_name,
                   u2.first_name as created_first_name, u2.last_name as created_last_name
            FROM tasks t
            LEFT JOIN task_statuses ts ON t.status_id = ts.id
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            WHERE t.id = ?
        ");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO tasks (title, description, status_id, project_id, assigned_to, due_date, priority, created_by, estimated_hours, actual_hours) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['title'],
            $data['description'] ?? null,
            $data['status_id'] ?? 1,
            $data['project_id'] ?? null,
            $data['assigned_to'] ?? null,
            $data['due_date'] ?? null,
            $data['priority'] ?? 'Medium',
            $data['created_by'],
            $data['estimated_hours'] ?? null,
            $data['actual_hours'] ?? null
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
        
        if (isset($data['status_id'])) {
            $fields[] = "status_id = ?";
            $values[] = $data['status_id'] ?? 1;
        }
        
        if (isset($data['project_id'])) {
            $fields[] = "project_id = ?";
            $values[] = $data['project_id'] ?? null;
        }
        
        if (isset($data['assigned_to'])) {
            $fields[] = "assigned_to = ?";
            $values[] = $data['assigned_to'] ?? null;
        }
        
        if (isset($data['due_date'])) {
            $fields[] = "due_date = ?";
            $values[] = $data['due_date'] ?? null;
        }
        
        if (isset($data['priority'])) {
            $fields[] = "priority = ?";
            $values[] = $data['priority'] ?? 'Medium';
        }
        
        if (isset($data['estimated_hours'])) {
            $fields[] = "estimated_hours = ?";
            $values[] = $data['estimated_hours'] ?? null;
        }
        
        if (isset($data['actual_hours'])) {
            $fields[] = "actual_hours = ?";
            $values[] = $data['actual_hours'] ?? null;
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM tasks WHERE id = ?");
        return $stmt->execute([$id]);
    }
}