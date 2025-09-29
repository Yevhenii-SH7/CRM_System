<?php

namespace App\Controllers;

use App\Models\Task;
use App\Models\Tag;

class TaskController
{
    private Task $taskModel;
    private Tag $tagModel;

    public function __construct()
    {
        $this->taskModel = new Task();
        $this->tagModel = new Tag();
    }

    public function index(): void
    {
        $filters = [
            'status_id' => $_GET['status_id'] ?? null,
            'project_id' => $_GET['project_id'] ?? null,
            'assigned_to' => $_GET['assigned_to'] ?? null,
        ];

        $tasks = $this->taskModel->findAll(array_filter($filters));
        
        foreach ($tasks as &$task) {
            $task['tags'] = $this->tagModel->findByTaskId($task['id']);
        }

        echo json_encode($tasks);
    }

    public function show(int $id): void
    {
        $task = $this->taskModel->findById($id);
        
        if (!$task) {
            http_response_code(404);
            echo json_encode(['error' => 'Task not found']);
            return;
        }

        $task['tags'] = $this->tagModel->findByTaskId($id);
        echo json_encode($task);
    }

    public function store(array $currentUser): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title is required']);
            return;
        }

        $input['created_by'] = $currentUser['user_id'];

        try {
            $taskId = $this->taskModel->create($input);
            
            if (!empty($input['tag_ids']) && is_array($input['tag_ids'])) {
                foreach ($input['tag_ids'] as $tagId) {
                    $this->tagModel->attachToTask($taskId, $tagId);
                }
            }

            $task = $this->taskModel->findById($taskId);
            $task['tags'] = $this->tagModel->findByTaskId($taskId);

            http_response_code(201);
            echo json_encode($task);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create task']);
        }
    }

    public function update(int $id, array $currentUser): void
    {
        $task = $this->taskModel->findById($id);
        
        if (!$task) {
            http_response_code(404);
            echo json_encode(['error' => 'Task not found']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $this->taskModel->update($id, $input);
            
            if (array_key_exists('tag_ids', $input)) {
                $oldTags = $this->tagModel->findByTaskId($id);
                foreach ($oldTags as $tag) {
                    $this->tagModel->detachFromTask($id, $tag['id']);
                }
                
                if (is_array($input['tag_ids'])) {
                    foreach ($input['tag_ids'] as $tagId) {
                        $this->tagModel->attachToTask($id, $tagId);
                    }
                }
            }

            $updatedTask = $this->taskModel->findById($id);
            $updatedTask['tags'] = $this->tagModel->findByTaskId($id);

            echo json_encode($updatedTask);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update task']);
        }
    }

    public function destroy(int $id, array $currentUser): void
    {
        $task = $this->taskModel->findById($id);
        
        if (!$task) {
            http_response_code(404);
            echo json_encode(['error' => 'Task not found']);
            return;
        }

        try {
            $this->taskModel->delete($id);
            echo json_encode(['message' => 'Task deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete task']);
        }
    }
}