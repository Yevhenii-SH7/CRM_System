DROP DATABASE IF EXISTS crm_db;
CREATE DATABASE IF NOT EXISTS crm_db;
USE crm_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    priority VARCHAR(50) DEFAULT 'Medium',
    start_date DATE,
    end_date DATE,
    client_id INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    hourly_rate DECIMAL(10,2) DEFAULT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE task_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    order_index INT NOT NULL DEFAULT 0
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status_id INT,
    project_id INT,
    assigned_to INT,
    due_date DATETIME,
    priority VARCHAR(50) DEFAULT 'Medium',
    estimated_hours DECIMAL(5,2) DEFAULT NULL,
    actual_hours DECIMAL(5,2) DEFAULT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (status_id) REFERENCES task_statuses(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#007bff'
);

CREATE TABLE task_tags (
    task_id INT,
    tag_id INT,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    user_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert task statuses
INSERT INTO task_statuses (name, order_index) VALUES 
('To Do', 1),
('In Progress', 2),
('Done', 3);

-- Insert test user (password: password)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
('admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin');

-- Insert test data
INSERT INTO clients (name, contact_email, phone, created_by) VALUES 
('Test Client', 'client@example.com', '+1234567890', 1);

INSERT INTO projects (title, description, status, priority, start_date, end_date, client_id, created_by) VALUES 
('CRM System Development', 'Complete CRM system with user management, task tracking, and reporting features', 'Active', 'High', '2024-01-01', '2024-12-31', 1, 1),
('Mobile App Development', 'iOS and Android mobile application for customer management', 'Active', 'Medium', '2024-02-01', '2024-11-30', 1, 1),
('API Integration Project', 'Third-party API integration for payment processing and data synchronization', 'Active', 'High', '2024-03-01', '2024-10-31', 1, 1),
('Website Redesign', 'Complete website redesign with modern UI/UX', 'Completed', 'Medium', '2024-01-15', '2024-06-15', 1, 1),
('Database Optimization', 'Performance optimization and scaling of existing database systems', 'Active', 'Low', '2024-04-01', '2024-09-30', 1, 1);

INSERT INTO tasks (title, description, status_id, project_id, priority, created_by) VALUES 
('Setup Development Environment', 'Configure development environment and tools for CRM project', 1, 1, 'High', 1),
('Design User Interface', 'Create wireframes and mockups for CRM interface', 1, 1, 'Medium', 1),
('Implement User Authentication', 'Develop login and registration system', 2, 1, 'High', 1),
('Write API Documentation', 'Create comprehensive API documentation', 3, 1, 'Low', 1),
('Mobile App Wireframes', 'Design mobile app user interface wireframes', 1, 2, 'Medium', 1),
('Backend API Development', 'Develop REST API for mobile app', 2, 2, 'High', 1),
('Payment Integration', 'Integrate payment processing APIs', 2, 3, 'High', 1),
('Database Schema Design', 'Design optimized database schema', 3, 3, 'Medium', 1);

INSERT INTO tags (name, color) VALUES 
('Frontend', '#007bff'),
('Backend', '#28a745'),
('Bug', '#dc3545'),
('Feature', '#ffc107');