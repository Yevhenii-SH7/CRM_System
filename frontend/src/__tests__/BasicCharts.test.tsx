import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import BasicCharts from '../components/dashboard/BasicCharts';

interface PieChartData {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface BarChartData {
  project: string;
  tasks: number;
}

jest.mock('@nivo/pie', () => ({
  ResponsivePie: ({ data }: { data: PieChartData[] }) => (
    <div data-testid="pie-chart">
      {data && data.map((item, index) => (
        <div key={index} data-testid={`pie-sector-${index}`}>
          {item.label}: {item.value}
        </div>
      ))}
    </div>
  )
}));

jest.mock('@nivo/bar', () => ({
  ResponsiveBar: ({ data }: { data: BarChartData[] }) => (
    <div data-testid="bar-chart">
      {data && data.map((item, index) => (
        <div key={index} data-testid={`bar-item-${index}`}>
          {item.project}: {item.tasks}
        </div>
      ))}
    </div>
  )
}));

describe('BasicCharts', () => {
  const mockGetDataColor = (label: string) => {
    const colorMap: Record<string, string> = {
      'To Do': '#2196F3',
      'In Progress': '#FF9800',
      'Done': '#4CAF50'
    };
    return colorMap[label] || '#999999';
  };

  const mockGetColorByString = () => {
    return '#666666';
  };

  const mockChartData = {
    tasksByStatus: [
      { name: 'To Do', value: 5 },
      { name: 'In Progress', value: 3 },
      { name: 'Done', value: 7 }
    ],
    tasksByProject: [
      { name: 'Project A', tasks: 4 },
      { name: 'Project B', tasks: 6 }
    ],
    monthlyEarnings: [
      { date: '2023-01-01', earnings: 1000 },
      { date: '2023-01-02', earnings: 1500 }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Task Distribution as a pie chart', () => {
    render(
      <BasicCharts
        chartData={mockChartData}
        getStatusColor={mockGetDataColor}
        getColorByString={mockGetColorByString}
      />
    );

    // Check that the Task Distribution section is rendered
    expect(screen.getByText('Task Distribution')).toBeInTheDocument();

    // Check that the pie chart components are rendered
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

    // Check that the pie chart contains the correct data
    expect(screen.getByTestId('pie-sector-0')).toHaveTextContent('To Do: 5');
    expect(screen.getByTestId('pie-sector-1')).toHaveTextContent('In Progress: 3');
    expect(screen.getByTestId('pie-sector-2')).toHaveTextContent('Done: 7');
  });

  it('renders Tasks by Project as a bar chart', () => {
    render(
      <BasicCharts
        chartData={mockChartData}
        getStatusColor={mockGetDataColor}
        getColorByString={mockGetColorByString}
      />
    );

    // Check that the Tasks by Project section is rendered
    expect(screen.getByText('Tasks by Projects')).toBeInTheDocument();

    // Check that the Tasks by Project bar chart is rendered (get the parent container first)
    const tasksByProjectContainer = screen.getByText('Tasks by Projects').closest('.MuiPaper-root');
    if (tasksByProjectContainer) {
      const barChart = within(tasksByProjectContainer as HTMLElement).getByTestId('bar-chart');
      expect(barChart).toBeInTheDocument();

      // Check that the bar chart contains the correct data
      expect(within(barChart).getByTestId('bar-item-0')).toHaveTextContent('Project A: 4');
      expect(within(barChart).getByTestId('bar-item-1')).toHaveTextContent('Project B: 6');
    }
  });

  it('shows "No data to display" when there is no task data', () => {
    render(
      <BasicCharts
        chartData={{ tasksByStatus: [], tasksByProject: [], monthlyEarnings: [] }}
        getStatusColor={mockGetDataColor}
        getColorByString={mockGetColorByString}
      />
    );

    // Check that all charts show "No data to display" (3 charts)
    const noDataMessages = screen.getAllByText('No data to display');
    expect(noDataMessages).toHaveLength(3);
  });

  it('renders correctly with only task status data', () => {
    const chartData = {
      tasksByStatus: [
        { name: 'To Do', value: 5 }
      ],
      tasksByProject: [],
      monthlyEarnings: []
    };

    render(
      <BasicCharts
        chartData={chartData}
        getStatusColor={mockGetDataColor}
        getColorByString={mockGetColorByString}
      />
    );

    // Check that Task Distribution shows data
    expect(screen.getByTestId('pie-sector-0')).toHaveTextContent('To Do: 5');

    // Check that Tasks by Project shows "No data to display"
    expect(screen.getByText('Tasks by Projects')).toBeInTheDocument();
    // Find the specific "No data to display" for Tasks by Projects chart
    const tasksByProjectSection = screen.getByText('Tasks by Projects').closest('.MuiPaper-root');
    expect(tasksByProjectSection).toBeInTheDocument();
    if (tasksByProjectSection) {
      const noDataMessages = within(tasksByProjectSection as HTMLElement).getAllByText('No data to display');
      expect(noDataMessages).toHaveLength(1);
    }
  });
});