<?php

namespace App\Controllers;

use App\Models\Tag;

class TagController
{
    private Tag $tagModel;

    public function __construct()
    {
        $this->tagModel = new Tag();
    }

    public function index(): void
    {
        $tags = $this->tagModel->findAll();
        echo json_encode($tags);
    }

    public function show(int $id): void
    {
        $tag = $this->tagModel->findById($id);
        
        if (!$tag) {
            http_response_code(404);
            echo json_encode(['error' => 'Tag not found']);
            return;
        }

        echo json_encode($tag);
    }

    public function store(array $currentUser): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            return;
        }

        try {
            $tagId = $this->tagModel->create($input);
            $tag = $this->tagModel->findById($tagId);

            http_response_code(201);
            echo json_encode($tag);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create tag']);
        }
    }

    public function update(int $id, array $currentUser): void
    {
        $tag = $this->tagModel->findById($id);
        
        if (!$tag) {
            http_response_code(404);
            echo json_encode(['error' => 'Tag not found']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $this->tagModel->update($id, $input);
            $updatedTag = $this->tagModel->findById($id);

            echo json_encode($updatedTag);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update tag']);
        }
    }

    public function destroy(int $id, array $currentUser): void
    {
        $tag = $this->tagModel->findById($id);
        
        if (!$tag) {
            http_response_code(404);
            echo json_encode(['error' => 'Tag not found']);
            return;
        }

        try {
            $this->tagModel->delete($id);
            echo json_encode(['message' => 'Tag deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete tag']);
        }
    }

    public function attachToTask(int $taskId, int $tagId): void
    {
        try {
            $this->tagModel->attachToTask($taskId, $tagId);
            echo json_encode(['message' => 'Tag attached to task successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to attach tag to task: ' . $e->getMessage()]);
        }
    }

    public function detachFromTask(int $taskId, int $tagId): void
    {
        try {
            $this->tagModel->detachFromTask($taskId, $tagId);
            echo json_encode(['message' => 'Tag detached from task successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to detach tag from task: ' . $e->getMessage()]);
        }
    }
}