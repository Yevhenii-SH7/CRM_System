import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragOverlay,
  SensorDescriptor,
  SensorOptions,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Task } from '../../types/task';
import { CSSProperties, ReactElement } from 'react';

interface TaskCardProps {
  task: Task;
  dragListeners?: React.HTMLAttributes<HTMLDivElement>;
}

interface SortableTaskCardProps {
  task: Task;
  TaskCard: (props: TaskCardProps) => ReactElement;
}

interface KanbanBoardProps {
  sensors: SensorDescriptor<SensorOptions>[];
  columns: Array<{ id: string; title: string; color: string }>;
  filteredTasks: Task[];
  activeTask: Task | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  TaskCard: (props: TaskCardProps) => ReactElement;
}

function SortableTaskCard({ task, TaskCard }: SortableTaskCardProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    isDragging
  } = useSortable({
    id: task.id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '8px',
    position: 'relative',
    zIndex: isDragging ? 999 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

function KanbanBoard({
  sensors,
  columns,
  filteredTasks,
  activeTask,
  handleDragStart,
  handleDragEnd,
  TaskCard
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const handleDragStartInternal = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    handleDragStart(event);
  };

  const handleDragEndInternal = (event: DragEndEvent) => {
    setActiveId(null);
    handleDragEnd(event);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
    >
      <Box display="flex" gap={2} flexWrap="wrap">
        {columns.map(column => {
          const columnTasks = filteredTasks.filter(task => task.status === column.id);
          const isOver = activeId && activeTask?.status !== column.id;
          
          return (
            <Box key={column.id} flex={1} minWidth={300}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: isOver ? '#bbdefb' : column.color,
                  borderRadius: '8px 8px 0 0',
                  fontWeight: 'bold',
                  color: '#1976d2',
                  cursor: 'grab',
                  border: isOver ? '2px dashed #1976d2' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#bbdefb',
                  }
                }}
              >
                {column.title} ({columnTasks.length})
              </Box>
              <SortableContext 
                items={columnTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnTasks.map(task => (
                  <SortableTaskCard key={task.id} task={task} TaskCard={TaskCard} />
                ))}
              </SortableContext>
            </Box>
          );
        })}
      </Box>
      <DragOverlay>
        {activeTask ? (
          <Card sx={{ opacity: 0.8, transform: 'rotate(5deg)', cursor: 'grabbing' }}>
            <CardContent>
              <Typography variant="subtitle2">{activeTask.title}</Typography>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;