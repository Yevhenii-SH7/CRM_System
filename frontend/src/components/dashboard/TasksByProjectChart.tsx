import React from 'react';
import { ChartCard, ChartCardContent, ChartTitle, ChartContainer, ChartSkeleton, NoDataContainer, NoDataText } from '../styled/ChartStyled';
import { ResponsiveBar } from '@nivo/bar';

interface ProjectTaskData {
  name: string;
  tasks: number;
}

interface TasksByProjectChartProps {
  data: ProjectTaskData[];
  loading?: boolean;
}

// Custom color scheme for projects based on CHART_ENHANCEMENTS_SUMMARY.md
const projectColors: Record<string, string> = {
  'CRM System Development': '#4169E1', // Royal Blue
  'Mobile App Development': '#32CD32', // Lime Green
  'API Integration Project': '#FF6347', // Tomato
  'Website Redesign': '#8A2BE2', // Blue Violet
  'Database Optimization': '#FFD700', // Gold
  'Test Project': '#4169E1', // Royal Blue
  'Test project added the field cost of work per hour': '#32CD32', // Lime Green
  'Company Website': '#FF6347', // Tomato
  'Archived Project': '#8A2BE2' // Blue Violet
};

function TasksByProjectChart({ data, loading }: TasksByProjectChartProps) {
  // Create color array based on project names
  const barColors = data.map(item => projectColors[item.name] || '#cccccc');

  // Create accessible description for screen readers
  const chartDescription = data && data.length > 0 
    ? `Bar chart showing tasks by projects. ${data.map(item => `${item.name}: ${item.tasks} tasks`).join(', ')}`
    : "Tasks by projects chart, no data available";

  return (
    <ChartCard>
      <ChartCardContent>
        <ChartTitle variant="h6" mb={2}>Tasks by Projects</ChartTitle>
        <ChartContainer>
          {loading ? (
            <ChartSkeleton variant="rectangular" width="100%" height="100%" data-testid="chart-skeleton" />
          ) : data && data.length > 0 && data[0]?.name !== 'No Data' ? (
            <>
              <div aria-hidden="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
                {chartDescription}
              </div>
              <ResponsiveBar
                data={data.map(item => ({
                  project: item.name,
                  tasks: item.tasks
                }))}
                keys={['tasks']}
                indexBy="project"
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                padding={0.3}
                colors={barColors}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Projects',
                  legendPosition: 'middle',
                  legendOffset: 40
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Tasks',
                  legendPosition: 'middle',
                  legendOffset: -50
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                animate={true}
                role="application"
                aria-label="Tasks by Projects Chart"
              />
            </>
          ) : (
            <NoDataContainer>
              <NoDataText variant="body2" color="text.secondary">
                No data to display
              </NoDataText>
            </NoDataContainer>
          )}
        </ChartContainer>
      </ChartCardContent>
    </ChartCard>
  );
};

export default TasksByProjectChart;