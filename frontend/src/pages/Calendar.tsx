import * as React from 'react';
import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Event, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { taskAPI, Task as APITask } from '../services/api';
import { Task } from '../types/task';
import CreateTaskDialog from '../components/ui/CreateTaskDialog';
import EditTaskDialog from '../components/ui/EditTaskDialog';

interface CalendarEvent extends Event {
  id: number;
  resource: Task;
  status?: 'To Do' | 'In Progress' | 'Done';
}

interface CalendarProps {
  onNavigateToTasks?: () => void;
}

const localizer = momentLocalizer(moment);

export function Calendar({ onNavigateToTasks }: CalendarProps): React.ReactElement {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<APITask[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<APITask | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dayTasks, setDayTasks] = useState<Task[]>([]);
  const [dayTasksOpen, setDayTasksOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [view, setView] = useState<View>('month'); 

  const statusColors = {
    'To Do': '#9c27b0',
    'In Progress': '#ff9800', 
    'Done': '#4caf50'
  };

  const priorityColors = {
    Low: '#4caf50',
    Medium: '#ff9800',
    High: '#f44336'
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const tasksData = await taskAPI.getTasks();
      setTasks(tasksData);
      
      // Convert tasks to calendar events
      const statusMap: Record<number, 'To Do' | 'In Progress' | 'Done'> = { 1: 'To Do', 2: 'In Progress', 3: 'Done' };
      const calendarEvents = tasksData
        .filter(task => task.due_date) // Only include tasks with due dates
        .map(task => {
          const taskStatus = statusMap[task.status_id as number] || 'To Do';
          const dueDate = task.due_date ? new Date(task.due_date) : new Date();
          return {
            id: task.id || 0,
            title: `${task.title} (${taskStatus})`,
            start: dueDate,
            end: dueDate,
            resource: { 
              ...task, 
              status: taskStatus,
              id: task.id || 0,
              title: task.title,
              priority: task.priority,
              status_id: task.status_id || 1
            } as Task,
            status: taskStatus // Add status to event for styling
          } as CalendarEvent;
        });
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Error loading tasks: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    const task = event.resource as APITask;
    const statusMap: Record<number, 'To Do' | 'In Progress' | 'Done'> = { 1: 'To Do', 2: 'In Progress', 3: 'Done' };
    const status = statusMap[task.status_id as number] || 'To Do';
    
    // Convert APITask to Task with status property
    const taskWithStatus: Task = {
      ...task,
      status,
      id: task.id || 0,
      title: task.title,
      priority: task.priority,
      status_id: task.status_id || 1
    };
    
    setSelectedTask(taskWithStatus);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; slots: Date[]; action: string }) => {
    const tasksForDay = tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = moment(task.due_date).format('YYYY-MM-DD');
      const slotDate = moment(slotInfo.start).format('YYYY-MM-DD');
      return taskDate === slotDate;
    }).map(task => {
      const statusMap: Record<number, 'To Do' | 'In Progress' | 'Done'> = { 1: 'To Do', 2: 'In Progress', 3: 'Done' };
      const status = statusMap[task.status_id as number] || 'To Do';
      return { 
        ...task, 
        status,
        id: task.id || 0,
        title: task.title,
        priority: task.priority,
        status_id: task.status_id || 1
      } as Task;
    });
    
    setDayTasks(tasksForDay);
    setSelectedDayDate(slotInfo.start);
    setDayTasksOpen(true);
  };

  const handleShowMore = (events: CalendarEvent[], date: Date) => {
    const tasksForDay = events.map(event => event.resource as Task);
    setDayTasks(tasksForDay);
    setSelectedDayDate(date);
    setDayTasksOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!deleteTask || !deleteTask.id) return;
    
    try {
      await taskAPI.deleteTask(deleteTask.id);
      await loadTasks();
      setDeleteTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Error deleting task: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Function to customize event appearance
  const eventPropGetter = (event: CalendarEvent) => {
    const status = event.status || 'To Do';
    const backgroundColor = statusColors[status] || statusColors['To Do'];
    
    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor,
        color: 'white',
        borderRadius: '4px',
        opacity: 0.9,
        border: 'none',
        padding: '2px 4px'
      }
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          📅 Calendar
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="outlined"
            onClick={onNavigateToTasks || (() => window.history.back())}
          >
            ← Back to My Tasks
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Task
          </Button>
          <Box display="flex" gap={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ width: 16, height: 16, backgroundColor: statusColors['To Do'], borderRadius: 1 }} />
              <Typography variant="caption">To Do</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ width: 16, height: 16, backgroundColor: statusColors['In Progress'], borderRadius: 1 }} />
              <Typography variant="caption">In Progress</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ width: 16, height: 16, backgroundColor: statusColors['Done'], borderRadius: 1 }} />
              <Typography variant="caption">Done</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        // Use the regular BigCalendar component instead of the drag and drop version
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '700px' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onShowMore={handleShowMore}
          selectable
          popup
          view={view} // Add view prop
          onView={setView} // Add onView prop
          eventPropGetter={eventPropGetter} // Add event styling
          messages={{
            date: 'Date',
            time: 'Time',
            event: 'Event',
            allDay: 'All Day',
            week: 'Week',
            work_week: 'Work Week',
            day: 'Day',
            month: 'Month',
            previous: 'Back',
            next: 'Next',
            yesterday: 'Yesterday',
            tomorrow: 'Tomorrow',
            today: 'Today',
            agenda: 'Agenda',
            noEventsInRange: 'No events in this range.',
            showMore: total => `+${total} more`
          }}
        />
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
        }}
        onTaskCreated={loadTasks}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        open={!!editTask}
        task={editTask}
        onClose={() => setEditTask(null)}
        onTaskUpdated={loadTasks}
      />

      {/* View Task Dialog */}
      <Dialog 
        open={!!selectedTask} 
        onClose={() => setSelectedTask(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedTask?.title}</Typography>
            <Box>
              <Tooltip title="Edit">
                <IconButton 
                  onClick={() => {
                    setEditTask(selectedTask);
                    setSelectedTask(null);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton 
                  onClick={() => {
                    if (selectedTask) {
                      // Find the full task object from the tasks array
                      const fullTask = tasks.find(t => t.id === selectedTask.id) || selectedTask;
                      setDeleteTask(fullTask as APITask);
                      setSelectedTask(null);
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              {selectedTask.description && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {selectedTask.description}
                </Typography>
              )}
            
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={selectedTask.status || 'To Do'}
                  size="small"
                  sx={{ backgroundColor: statusColors[selectedTask.status || 'To Do'], color: 'white' }}
                />
                <Chip
                  label={selectedTask.priority}
                  size="small"
                  sx={{ backgroundColor: priorityColors[selectedTask.priority], color: 'white' }}
                />
              </Box>
            
              {selectedTask.due_date && (
                <Typography variant="body2" color="text.secondary">
                  📅 Deadline: {moment(selectedTask.due_date).format('DD.MM.YYYY HH:mm')}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTask(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Day Tasks Dialog */}
      <Dialog 
        open={dayTasksOpen} 
        onClose={() => setDayTasksOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Tasks for {selectedDayDate && moment(selectedDayDate).format('DD.MM.YYYY')}
        </DialogTitle>
        <DialogContent>
          {dayTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" mb={2}>
                📅 No tasks for this day
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedDayDate(selectedDayDate);
                  setDayTasksOpen(false);
                  setCreateDialogOpen(true);
                }}
              >
                Create Task
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {dayTasks.map((task) => (
                <Box 
                  key={task.id} 
                  sx={{ 
                    p: 2, 
                    border: '1px solid #ddd', 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                  onClick={() => {
                    setSelectedTask(task);
                    setDayTasksOpen(false);
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {task.title}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={task.status || 'To Do'}
                        size="small"
                        sx={{ backgroundColor: statusColors[task.status || 'To Do'], color: 'white' }}
                      />
                      <Chip
                        label={task.priority}
                        size="small"
                        sx={{ backgroundColor: priorityColors[task.priority], color: 'white' }}
                      />
                    </Box>
                  </Box>
                  {task.description && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {task.description}
                    </Typography>
                  )}
                  {task.due_date && (
                    <Typography variant="caption" color="text.secondary">
                      📅 Deadline: {moment(task.due_date).format('DD.MM.YYYY HH:mm')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {dayTasks.length > 0 && (
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedDayDate(selectedDayDate);
                setDayTasksOpen(false);
                setCreateDialogOpen(true);
              }}
            >
              Add Task
            </Button>
          )}
          <Button onClick={() => setDayTasksOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTask} onClose={() => setDeleteTask(null)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to delete task "{deleteTask?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTask(null)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;