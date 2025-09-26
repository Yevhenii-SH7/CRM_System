import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksByProjectChart from '../components/dashboard/TasksByProjectChart';

// Mock the nivo bar component
jest.mock('@nivo/bar', () => ({
  ResponsiveBar: ({ data }: { data: Array<{ project: string; tasks: number }> }) => (
    <div data-testid="bar-chart">
      {data && data.map((item, index) => (
        <div key={index} data-testid={`bar-item-${index}`}>
          {item.project}: {item.tasks}
        </div>
      ))}
    </div>
  )
}));

describe('TasksByProjectChart', () => {
  const mockData = [
    { name: 'Project A', tasks: 5 },
    { name: 'Project B', tasks: 3 },
    { name: 'Project C', tasks: 7 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the chart title', () => {
    render(<TasksByProjectChart data={mockData} />);
    expect(screen.getByText('Tasks by Projects')).toBeInTheDocument();
  });

  it('renders the bar chart with correct data', () => {
    render(<TasksByProjectChart data={mockData} />);
    
    // Check that the bar chart is rendered
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    // Check that the bar chart contains the correct data
    expect(screen.getByTestId('bar-item-0')).toHaveTextContent('Project A: 5');
    expect(screen.getByTestId('bar-item-1')).toHaveTextContent('Project B: 3');
    expect(screen.getByTestId('bar-item-2')).toHaveTextContent('Project C: 7');
  });

  it('shows skeleton loader when loading', () => {
    render(<TasksByProjectChart data={mockData} loading={true} />);
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
  });

  it('shows "No data to display" when there is no data', () => {
    render(<TasksByProjectChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('shows "No data to display" when data has "No Data" placeholder', () => {
    const noData = [{ name: 'No Data', tasks: 0 }];
    render(<TasksByProjectChart data={noData} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });
});