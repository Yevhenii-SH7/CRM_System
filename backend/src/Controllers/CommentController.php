<?php

namespace App\Controllers;

use App\Models\Comment;

class CommentController
{
    private Comment $commentModel;

    public function __construct()
    {
        $this->commentModel = new Comment();
    }

    public function indexByTask(int $taskId): void
    {
        $comments = $this->commentModel->findByTaskId($taskId);
        echo json_encode($comments);
    }

    public function show(int $id): void
    {
        $comment = $this->commentModel->findById($id);
        
        if (!$comment) {
            http_response_code(404);
            echo json_encode(['error' => 'Comment not found']);
            return;
        }

        echo json_encode($comment);
    }

    public function store(array $currentUser): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (!isset($input['task_id']) || !isset($input['content']) || empty(trim($input['content']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Task ID and content are required']);
            return;
        }

        // Set user_id from current user
        $input['user_id'] = $currentUser['user_id'];

        try {
            $commentId = $this->commentModel->create($input);
            $comment = $this->commentModel->findById($commentId);

            http_response_code(201);
            echo json_encode($comment);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create comment']);
        }
    }

    public function update(int $id, array $currentUser): void
    {
        // Check if comment exists
        $comment = $this->commentModel->findById($id);
        
        if (!$comment) {
            http_response_code(404);
            echo json_encode(['error' => 'Comment not found']);
            return;
        }

        // Check if user can edit this comment
        if ($comment['user_id'] !== $currentUser['user_id'] && $currentUser['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        // Validate content
        if (!isset($input['content']) || empty(trim($input['content']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Content is required']);
            return;
        }

        try {
            $this->commentModel->update($id, $input);
            $updatedComment = $this->commentModel->findById($id);

            echo json_encode($updatedComment);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update comment']);
        }
    }

    public function destroy(int $id, array $currentUser): void
    {
        // Check if comment exists
        $comment = $this->commentModel->findById($id);
        
        if (!$comment) {
            http_response_code(404);
            echo json_encode(['error' => 'Comment not found']);
            return;
        }

        // Check if user can delete this comment
        if ($comment['user_id'] !== $currentUser['user_id'] && $currentUser['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }

        try {
            $this->commentModel->delete($id);
            echo json_encode(['message' => 'Comment deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete comment']);
        }
    }
}