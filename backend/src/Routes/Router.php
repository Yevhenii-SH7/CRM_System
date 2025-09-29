<?php

namespace App\Routes;

use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\TaskController;
use App\Controllers\ClientController;
use App\Controllers\ProjectController;
use App\Controllers\TagController;
use App\Controllers\CommentController;
use App\Middleware\AuthMiddleware;

class Router
{
    private array $routes = [];
    private AuthMiddleware $authMiddleware;
    private array $jwtConfig;
    private array $corsConfig;

    public function __construct(array $jwtConfig, array $corsConfig = [])
    {
        $this->jwtConfig = $jwtConfig;
        $this->corsConfig = $corsConfig;
        $this->authMiddleware = new AuthMiddleware($jwtConfig);
        $this->defineRoutes();
    }

    private function defineRoutes(): void
    {
        $this->routes['POST']['/api/register'] = [AuthController::class, 'register', false];
        $this->routes['POST']['/api/login'] = [AuthController::class, 'login', false];

        // Protected routes
        // Users
        $this->routes['GET']['/api/users'] = [UserController::class, 'index', true];
        $this->routes['GET']['/api/users/{id}'] = [UserController::class, 'show', true];
        $this->routes['POST']['/api/users'] = [UserController::class, 'store', true];
        $this->routes['PUT']['/api/users/{id}'] = [UserController::class, 'update', true];
        $this->routes['DELETE']['/api/users/{id}'] = [UserController::class, 'destroy', true];

        // Tasks
        $this->routes['GET']['/api/tasks'] = [TaskController::class, 'index', true];
        $this->routes['GET']['/api/tasks/{id}'] = [TaskController::class, 'show', true];
        $this->routes['POST']['/api/tasks'] = [TaskController::class, 'store', true];
        $this->routes['PUT']['/api/tasks/{id}'] = [TaskController::class, 'update', true];
        $this->routes['DELETE']['/api/tasks/{id}'] = [TaskController::class, 'destroy', true];

        // Clients
        $this->routes['GET']['/api/clients'] = [ClientController::class, 'index', true];
        $this->routes['GET']['/api/clients/{id}'] = [ClientController::class, 'show', true];
        $this->routes['POST']['/api/clients'] = [ClientController::class, 'store', true];
        $this->routes['PUT']['/api/clients/{id}'] = [ClientController::class, 'update', true];
        $this->routes['DELETE']['/api/clients/{id}'] = [ClientController::class, 'destroy', true];

        // Projects
        $this->routes['GET']['/api/projects'] = [ProjectController::class, 'index', true];
        $this->routes['GET']['/api/projects/{id}'] = [ProjectController::class, 'show', true];
        $this->routes['POST']['/api/projects'] = [ProjectController::class, 'store', true];
        $this->routes['PUT']['/api/projects/{id}'] = [ProjectController::class, 'update', true];
        $this->routes['DELETE']['/api/projects/{id}'] = [ProjectController::class, 'destroy', true];

        // Tags
        $this->routes['GET']['/api/tags'] = [TagController::class, 'index', true];
        $this->routes['GET']['/api/tags/{id}'] = [TagController::class, 'show', true];
        $this->routes['POST']['/api/tags'] = [TagController::class, 'store', true];
        $this->routes['PUT']['/api/tags/{id}'] = [TagController::class, 'update', true];
        $this->routes['DELETE']['/api/tags/{id}'] = [TagController::class, 'destroy', true];

        // Tag-Task relations
        $this->routes['POST']['/api/tasks/{taskId}/tags/{tagId}'] = [TagController::class, 'attachToTask', true];
        $this->routes['DELETE']['/api/tasks/{taskId}/tags/{tagId}'] = [TagController::class, 'detachFromTask', true];

        // Comments
        $this->routes['GET']['/api/tasks/{taskId}/comments'] = [CommentController::class, 'indexByTask', true];
        $this->routes['GET']['/api/comments/{id}'] = [CommentController::class, 'show', true];
        $this->routes['POST']['/api/comments'] = [CommentController::class, 'store', true];
        $this->routes['PUT']['/api/comments/{id}'] = [CommentController::class, 'update', true];
        $this->routes['DELETE']['/api/comments/{id}'] = [CommentController::class, 'destroy', true];
    }

    public function handle(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = $_SERVER['REQUEST_URI'];
        $path = parse_url($uri, PHP_URL_PATH);

        // Handle CORS preflight OPTIONS requests
        if ($method === 'OPTIONS') {
            // Set CORS headers from config or use defaults
            $allowedOrigins = $this->corsConfig['allowed_origins'] ?? '*';
            $allowedMethods = $this->corsConfig['allowed_methods'] ?? 'GET, POST, PUT, DELETE, OPTIONS';
            $allowedHeaders = $this->corsConfig['allowed_headers'] ?? 'Content-Type, Authorization, X-Requested-With';
            
            // Handle origin
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
            $originsArray = explode(',', $allowedOrigins);
            
            if (in_array($origin, $originsArray) || $allowedOrigins === '*') {
                header("Access-Control-Allow-Origin: $origin");
            } else {
                header("Access-Control-Allow-Origin: *");
            }
            
            header("Access-Control-Allow-Methods: $allowedMethods");
            header("Access-Control-Allow-Headers: $allowedHeaders");
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');
            http_response_code(200);
            exit(0);
        }

        // Set CORS headers for all requests
        $allowedOrigins = $this->corsConfig['allowed_origins'] ?? '*';
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        $originsArray = explode(',', $allowedOrigins);
        
        if (in_array($origin, $originsArray) || $allowedOrigins === '*') {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        
        header('Access-Control-Allow-Credentials: true');

        // Find matching route
        $route = $this->findRoute($method, $path);

        if (!$route) {
            http_response_code(404);
            echo json_encode(['error' => 'Route not found']);
            return;
        }

        [$controllerClass, $action, $requiresAuth, $params] = $route;

        // Check authentication
        $currentUser = null;
        if ($requiresAuth) {
            $currentUser = $this->authMiddleware->requireAuth();
        }

        // Create controller and call method
        if ($controllerClass === AuthController::class) {
            $controller = new $controllerClass($this->jwtConfig);
        } else {
            $controller = new $controllerClass();
        }

        // Call controller method with parameters
        if ($currentUser) {
            $paramValues = array_values($params);
            $paramValues[] = $currentUser;
            $controller->$action(...$paramValues);
        } else {
            $controller->$action(...array_values($params));
        }
    }

    private function findRoute(string $method, string $path): ?array
    {
        if (!isset($this->routes[$method])) {
            return null;
        }

        foreach ($this->routes[$method] as $pattern => $route) {
            $params = $this->matchRoute($pattern, $path);
            if ($params !== null) {
                return [$route[0], $route[1], $route[2], $params];
            }
        }

        return null;
    }

    private function matchRoute(string $pattern, string $path): ?array
    {
        // Convert pattern to regular expression
        $regex = preg_replace('/\{(\w+)\}/', '(\d+)', $pattern);
        $regex = '#^' . $regex . '$#';

        if (preg_match($regex, $path, $matches)) {
            array_shift($matches); // Remove full match
            
            // Extract parameter names from pattern
            preg_match_all('/\{(\w+)\}/', $pattern, $paramNames);
            $paramNames = $paramNames[1];

            $params = [];
            foreach ($paramNames as $index => $name) {
                $params[$name] = (int) $matches[$index];
            }

            return $params;
        }

        return null;
    }
}