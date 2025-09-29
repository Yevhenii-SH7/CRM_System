<?php

namespace App\Controllers;

use App\Models\Project;

class ProjectController
{
    private Project $projectModel;

    public function __construct()
    {
        $this->projectModel = new Project();
    }

    public function index(): void
    {
        $projects = $this->projectModel->findAll();
        echo json_encode($projects);
    }

    public function show(int $id): void
    {
        $project = $this->projectModel->findById($id);
        
        if (!$project) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            return;
        }

        echo json_encode($project);
    }

    public function store(array $currentUser): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['title']) || empty(trim($input['title']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Title is required']);
            return;
        }

        $input['created_by'] = $currentUser['user_id'];

        try {
            $projectId = $this->projectModel->create($input);
            $project = $this->projectModel->findById($projectId);

            http_response_code(201);
            echo json_encode($project);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create project']);
        }
    }

    public function update(int $id, array $currentUser): void
    {
        $project = $this->projectModel->findById($id);
        
        if (!$project) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $this->projectModel->update($id, $input);
            $updatedProject = $this->projectModel->findById($id);

            echo json_encode($updatedProject);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update project']);
        }
    }

    public function destroy(int $id, array $currentUser): void
    {
        $project = $this->projectModel->findById($id);
        
        if (!$project) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            return;
        }

        try {
            $this->projectModel->delete($id);
            echo json_encode(['message' => 'Project deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete project']);
        }
    }
}