export interface Task {
  id: number;
  title: string;
  description?: string;
  status_id: number;
  project_id?: number;
  assigned_to?: number;
  due_date?: string;
  priority: 'Low' | 'Medium' | 'High';
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  status: 'To Do' | 'In Progress' | 'Done';
}