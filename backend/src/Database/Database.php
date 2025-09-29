<?php

namespace App\Database;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;
    private static array $config = [];

    public static function setConfig(array $config): void
    {
        self::$config = $config;
    }

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            try {
                if (isset(self::$config['socket']) && file_exists(self::$config['socket'])) {
                    $dsn = sprintf(
                        'mysql:unix_socket=%s;dbname=%s;charset=%s',
                        self::$config['socket'],
                        self::$config['name'],
                        self::$config['charset']
                    );
                } else {
                    $dsn = sprintf(
                        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                        self::$config['host'],
                        self::$config['port'],
                        self::$config['name'],
                        self::$config['charset']
                    );
                }

                $options = self::$config['options'] ?? [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];

                self::$instance = new PDO(
                    $dsn,
                    self::$config['user'],
                    self::$config['password'],
                    $options
                );
            } catch (PDOException $e) {
                throw new PDOException('Database connection failed: ' . $e->getMessage());
            }
        }

        return self::$instance;
    }

    public static function beginTransaction(): void
    {
        self::getConnection()->beginTransaction();
    }

    public static function commit(): void
    {
        self::getConnection()->commit();
    }

    public static function rollback(): void
    {
        self::getConnection()->rollback();
    }
}