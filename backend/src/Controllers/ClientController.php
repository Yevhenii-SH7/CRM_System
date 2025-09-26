<?php

namespace App\Controllers;

use App\Models\Client;

class ClientController
{
    private Client $clientModel;

    public function __construct()
    {
        $this->clientModel = new Client();
    }

    public function index(): void
    {
        $clients = $this->clientModel->findAll();
        echo json_encode($clients);
    }

    public function show(int $id): void
    {
        $client = $this->clientModel->findById($id);
        
        if (!$client) {
            http_response_code(404);
            echo json_encode(['error' => 'Client not found']);
            return;
        }

        echo json_encode($client);
    }

    public function store(array $currentUser): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['name']) || empty(trim($input['name']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            return;
        }

        $input['created_by'] = $currentUser['user_id'];

        try {
            $clientId = $this->clientModel->create($input);
            $client = $this->clientModel->findById($clientId);

            http_response_code(201);
            echo json_encode($client);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create client']);
        }
    }

    public function update(int $id, array $currentUser): void
    {
        $client = $this->clientModel->findById($id);
        
        if (!$client) {
            http_response_code(404);
            echo json_encode(['error' => 'Client not found']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $this->clientModel->update($id, $input);
            $updatedClient = $this->clientModel->findById($id);

            echo json_encode($updatedClient);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update client']);
        }
    }

    public function destroy(int $id, array $currentUser): void
    {
        $client = $this->clientModel->findById($id);
        
        if (!$client) {
            http_response_code(404);
            echo json_encode(['error' => 'Client not found']);
            return;
        }

        try {
            $this->clientModel->delete($id);
            echo json_encode(['message' => 'Client deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete client']);
        }
    }
}