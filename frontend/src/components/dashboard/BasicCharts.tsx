import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { useLocale } from '../../contexts/LocaleContext';

interface ChartData {
  tasksByStatus?: Array<{ name: string; value: number }>;
  tasksByProject?: Array<{ name: string; tasks: number }>;
  monthlyEarnings?: Array<{ date: string; earnings: number }>;
}

interface BasicChartsProps {
  chartData: ChartData;
  getStatusColor: (label: string) => string;
  getColorByString: (str: string) => string;
}

function BasicCharts({ chartData, getStatusColor }: BasicChartsProps) {
  const { t } = useLocale();
  const { tasksByStatus = [], tasksByProject = [], monthlyEarnings = [] } = chartData;

  // Create accessible description for screen readers for the pie chart
  const pieChartDescription = tasksByStatus.length > 0 
    ? `Pie chart showing task distribution. ${tasksByStatus.map(item => `${item.name}: ${item.value} tasks`).join(', ')}`
    : "Task distribution chart, no data available";

  // Create accessible description for screen readers for the bar chart
  const barChartDescription = tasksByProject.length > 0 
    ? `Bar chart showing tasks by projects. ${tasksByProject.map(item => `${item.name}: ${item.tasks} tasks`).join(', ')}`
    : "Tasks by projects chart, no data available";

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={2}>
      {/* Task Distribution Chart */}
      <Paper sx={{ p: 2, height: 350 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {t('dashboard.taskDistribution')}
        </Typography>
        <Box sx={{ height: 300 }}>
          {tasksByStatus.length > 0 ? (
            <>
              <div aria-hidden="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
                {pieChartDescription}
              </div>
              <ResponsivePie
                data={tasksByStatus.map(item => ({
                  id: item.name,
                  label: item.name,
                  value: item.value,
                  color: getStatusColor(item.name)
                }))}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={tasksByStatus.map(item => getStatusColor(item.name))}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle',
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemTextColor: '#000'
                        }
                      }
                    ]
                  }
                ]}
                aria-label="Task Distribution Chart"
              />
            </>
          ) : (
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No data to display
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Tasks by Projects Chart */}
      <Paper sx={{ p: 2, height: 350 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {t('dashboard.tasksByProjects')}
        </Typography>
        <Box sx={{ height: 300 }}>
          {tasksByProject.length > 0 ? (
            <>
              <div aria-hidden="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
                {barChartDescription}
              </div>
              <ResponsiveBar
                data={tasksByProject.map(item => ({
                  project: item.name,
                  tasks: item.tasks
                }))}
                keys={['tasks']}
                indexBy="project"
                margin={{ top: 20, right: 20, bottom: 100, left: 60 }}
                padding={0.3}
                colors={{ scheme: 'nivo' }}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  format: (value: string) =>
                    value.length > 10 ? `${value.slice(0, 10)}…` : value,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: t('common.tasks'),
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
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No data to display
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Monthly Earnings Chart */}
      <Paper sx={{ p: 2, height: 350 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {t('dashboard.monthlyEarnings')}
        </Typography>
        <Box sx={{ height: 300 }}>
          {monthlyEarnings.length > 0 ? (
            <>
              <div aria-hidden="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
                {`Bar chart showing monthly earnings. ${monthlyEarnings.map(item => `${item.date}: €${item.earnings}`).join(', ')}`}
              </div>
              <ResponsiveBar
                data={monthlyEarnings.map(item => ({
                  date: item.date,
                  earnings: item.earnings
                }))}
                keys={['earnings']}
                indexBy="date"
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                padding={0.3}
                colors={{ scheme: 'nivo' }}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: t('common.date'),
                  legendPosition: 'middle',
                  legendOffset: 40
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: t('dashboard.earnings'),
                  legendPosition: 'middle',
                  legendOffset: -50
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                animate={true}
                role="application"
                aria-label="Monthly Earnings Chart"
              />
            </>
          ) : (
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No data to display
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default BasicCharts;