<?php

namespace App\Models;

use App\Database\Database;
use PDO;

class Comment
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findByTaskId(int $taskId): array
    {
        $stmt = $this->db->prepare("
            SELECT c.*, u.first_name, u.last_name, u.email
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.task_id = ?
            ORDER BY c.created_at ASC
        ");
        $stmt->execute([$taskId]);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT c.*, u.first_name, u.last_name, u.email
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        ");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO comments (task_id, user_id, content) 
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([
            $data['task_id'],
            $data['user_id'],
            $data['content']
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare("UPDATE comments SET content = ? WHERE id = ?");
        return $stmt->execute([$data['content'], $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM comments WHERE id = ?");
        return $stmt->execute([$id]);
    }
}