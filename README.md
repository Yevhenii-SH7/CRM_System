# CRM Task Planner

A comprehensive project management system for freelancers.

## Features

- User authentication (JWT)
- Task management with Kanban board
- Project tracking
- Client management
- Dashboard with metrics and analytics
- Responsive design for mobile devices

## Prerequisites

- Docker and Docker Compose
- Node.js (for development)
- PHP 8.1+ (for development)
- MySQL (for development)

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crm_task_planner
   ```

2. Start the development environment:
   ```bash
   docker-compose up --build -d
   ```

3. Access the application:
   - Frontend: http://localhost:3009
   - Backend API: http://localhost:8080
   - phpMyAdmin: http://localhost:8083
   - demo: 
         login: admin@example.com
         password: password

## Production Setup

1. Build and start the production environment:
   ```bash
   docker-compose -f docker-compose.production.yml up --build -d
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - demo: 
         login: admin@example.com
         password: password


## Deployment to Render

1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect your forked repository
4. Set the following environment variables in the Render dashboard:
   - `DB_HOST`: Your MySQL host
   - `DB_PORT`: Your MySQL port (usually 3306)
   - `DB_NAME`: Your database name
   - `DB_USER`: Your database user
   - `DB_PASSWORD`: Your database password (keep this secret)
   - `JWT_SECRET`: A secure random string for JWT signing
5. Set the build command to: `composer install`
6. Set the start command to: `php -S 0.0.0.0:$PORT -t backend/public`
7. Deploy the application

## Deployment to Railway

1. Fork this repository to your GitHub account
2. Create a new project on Railway
3. Provision a MySQL database
4. Add a new service and connect your forked repository
5. Set the following environment variables in the Railway dashboard:
   - `JWT_SECRET`: A secure random string for JWT signing
   - `MYSQLHOST`: Provided by Railway database
   - `MYSQLPORT`: Provided by Railway database (usually 3306)
   - `MYSQLDATABASE`: Provided by Railway database
   - `MYSQLUSER`: Provided by Railway database
   - `MYSQLPASSWORD`: Provided by Railway database
6. Deploy the application

## Environment Variables

### Frontend
- `VITE_API_URL`: Backend API URL (default: http://localhost:8080 in production)

### Backend
- `DB_HOST`: Database host (default: mysql)
- `DB_PORT`: Database port (default: 3306)
- `DB_NAME`: Database name (default: crm_db)
- `DB_USER`: Database user (default: crm_user)
- `DB_PASSWORD`: Database password (default: crm_password)
- `JWT_SECRET`: JWT secret key
- `JWT_EXPIRATION`: JWT expiration time in seconds (default: 86400)
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins (default: http://localhost:3000)

## API Endpoints

- `GET /api.php?action=dashboard_summary` - Get dashboard metrics
- `GET /api.php?action=recent_tasks` - Get recent tasks
- `GET /api.php?action=active_projects` - Get active projects
- `GET /api.php?action=tasks[&deleted=true]` - Get all tasks (optionally including deleted)
- `POST /api.php?action=tasks` - Create a new task
- `PUT /api.php?action=tasks&id={id}` - Update a task
- `DELETE /api.php?action=tasks&id={id}[&permanent=true]` - Delete/archive a task
- `GET /api.php?action=projects` - Get all projects
- `POST /api.php?action=projects` - Create a new project
- `PUT /api.php?action=projects&id={id}` - Update a project
- `DELETE /api.php?action=projects&id={id}` - Delete a project
- `GET /api.php?action=clients` - Get all clients
- `POST /api.php?action=clients` - Create a new client
- `PUT /api.php?action=clients&id={id}` - Update a client
- `DELETE /api.php?action=clients&id={id}` - Delete a client
- `POST /api.php?action=login` - User login
- `POST /api.php?action=register` - User registration
- `GET /api.php?action=users` - Get all users
- `PUT /api.php?action=users&id={id}` - Update a user

## Database Schema

The database is automatically initialized with the schema defined in `database/init.sql`.

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure that:
1. The `CORS_ALLOWED_ORIGINS` environment variable is set correctly in the backend
2. The frontend is making requests to the correct API URL

### Database Connection Issues
If the application cannot connect to the database:
1. Verify that the database service is running
2. Check the database credentials in the environment variables
3. Ensure the database has been initialized with the schema

### API URL Issues
If the frontend is not connecting to the correct backend URL:
1. Check that the `VITE_API_URL` environment variable is set correctly
2. Rebuild the frontend if necessary

## Development Notes

- The frontend uses React with TypeScript and Vite
- The backend uses PHP with a MySQL database
- All services are containerized with Docker for easy deployment
- The application follows a responsive design approach