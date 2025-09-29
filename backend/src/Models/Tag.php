<?php

namespace App\Models;

use App\Database\Database;
use PDO;

class Tag
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM tags ORDER BY name");
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM tags WHERE id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByTaskId(int $taskId): array
    {
        $stmt = $this->db->prepare("
            SELECT t.* FROM tags t
            INNER JOIN task_tags tt ON t.id = tt.tag_id
            WHERE tt.task_id = ?
            ORDER BY t.name
        ");
        $stmt->execute([$taskId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare("INSERT INTO tags (name, color) VALUES (?, ?)");
        $stmt->execute([
            $data['name'],
            $data['color'] ?? '#007bff'
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];
        
        if (isset($data['name'])) {
            $fields[] = "name = ?";
            $values[] = $data['name'];
        }
        
        if (isset($data['color'])) {
            $fields[] = "color = ?";
            $values[] = $data['color'] ?? '#007bff';
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = "UPDATE tags SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM task_tags WHERE tag_id = ?");
        $stmt->execute([$id]);
        $stmt = $this->db->prepare("DELETE FROM tags WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function attachToTask(int $taskId, int $tagId): bool
    {
        $stmt = $this->db->prepare("INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)");
        return $stmt->execute([$taskId, $tagId]);
    }

    public function detachFromTask(int $taskId, int $tagId): bool
    {
        $stmt = $this->db->prepare("DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?");
        return $stmt->execute([$taskId, $tagId]);
    }
}