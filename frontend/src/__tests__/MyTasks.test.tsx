import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyTasks from '../components/MyTasks';

// Mock the API calls
jest.mock('../services/api', () => ({
  taskAPI: {
    getTasks: jest.fn().mockResolvedValue([
      { 
        id: 1, 
        title: 'Test Task 1', 
        description: 'Description 1', 
        status: 'To Do', 
        priority: 'High',
        status_id: 1,
        due_date: '2023-12-31'
      },
      { 
        id: 2, 
        title: 'Test Task 2', 
        description: 'Description 2', 
        status: 'In Progress', 
        priority: 'Medium',
        status_id: 2,
        due_date: '2023-12-31'
      }
    ]),
    updateTask: jest.fn().mockResolvedValue({}),
    deleteTask: jest.fn().mockResolvedValue({})
  },
  projectAPI: {
    getProjects: jest.fn().mockResolvedValue([])
  }
}));

// Mock the child components
jest.mock('../components/ui/CreateTaskDialog', () => {
  return function MockCreateTaskDialog() {
    return <div data-testid="create-task-dialog">Create Task Dialog</div>;
  };
});

jest.mock('../components/ui/EditTaskDialog', () => {
  return function MockEditTaskDialog() {
    return <div data-testid="edit-task-dialog">Edit Task Dialog</div>;
  };
});

jest.mock('../components/ui/TaskStats', () => {
  return function MockTaskStats() {
    return <div>Task Stats</div>;
  };
});

describe('MyTasks Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Kanban board with tasks', async () => {
    render(<MyTasks />);
    
    // Wait for the tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    // Check that the Kanban board columns are rendered
    expect(screen.getByText(/📋 To Do \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/🔄 In Progress \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/✅ Done \(0\)/)).toBeInTheDocument();
  });

  it('shows draggable areas for tasks', async () => {
    render(<MyTasks />);
    
    // Wait for the tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Check that draggable areas exist
    const draggableAreas = screen.getAllByTestId(/draggable-area-/);
    expect(draggableAreas).toHaveLength(2);
  });

  it('allows opening edit dialog when clicking edit button', async () => {
    render(<MyTasks />);
    
    // Wait for the tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Find and click the edit button for the first task
    const editButton = screen.getAllByTestId(/edit-button-/)[0];
    fireEvent.click(editButton);

    // Check that the edit dialog is opened
    expect(screen.getByTestId('edit-task-dialog')).toBeInTheDocument();
  });

  it('allows opening delete confirmation when clicking delete button', async () => {
    render(<MyTasks />);
    
    // Wait for the tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Find and click the delete button for the first task
    const deleteButton = screen.getAllByTestId(/delete-button-/)[0];
    fireEvent.click(deleteButton);

    // Check that the delete confirmation dialog is opened
    expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();
  });
});