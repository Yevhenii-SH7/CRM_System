<?php

namespace App\Models;

use App\Database\Database;
use PDO;

class Client
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query("
            SELECT c.*, u.first_name as created_first_name, u.last_name as created_last_name
            FROM clients c
            LEFT JOIN users u ON c.created_by = u.id
            ORDER BY c.created_at DESC
        ");
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT c.*, u.first_name as created_first_name, u.last_name as created_last_name
            FROM clients c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ?
        ");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO clients (name, contact_email, phone, address, created_by) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['name'],
            $data['contact_email'] ?? null,
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['created_by']
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
        
        if (isset($data['contact_email'])) {
            $fields[] = "contact_email = ?";
            $values[] = $data['contact_email'] ?? null;
        }
        
        if (isset($data['phone'])) {
            $fields[] = "phone = ?";
            $values[] = $data['phone'] ?? null;
        }
        
        if (isset($data['address'])) {
            $fields[] = "address = ?";
            $values[] = $data['address'] ?? null;
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = "UPDATE clients SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM clients WHERE id = ?");
        return $stmt->execute([$id]);
    }
}