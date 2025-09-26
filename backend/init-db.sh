#!/bin/bash

# Wait for MySQL to be ready
until mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e ";" ; do
  echo "Waiting for MySQL to be ready..."
  sleep 5
done

echo "MySQL is ready. Initializing database..."

# Run database initialization script
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /var/www/html/../database/init.sql

echo "Database initialization complete."