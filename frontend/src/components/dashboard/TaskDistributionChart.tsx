import React from 'react';
import { ChartCard, ChartCardContent, ChartTitle, ChartContainer, ChartSkeleton, NoDataContainer, NoDataText } from '../styled/ChartStyled';
import { ResponsivePie } from '@nivo/pie';

interface TaskStatusData {
  name: string;
  value: number;
  [key: string]: string | number | boolean | Record<string, unknown> | unknown[];
}

interface TaskDistributionChartProps {
  data: TaskStatusData[];
  getStatusColor: (status: string) => string;
  loading?: boolean;
}

function TaskDistributionChart({ data, getStatusColor, loading }: TaskDistributionChartProps) {
  const formattedData = data;

  return (
    <ChartCard>
      <ChartCardContent>
        <ChartTitle variant="h6" mb={2}>Task Distribution</ChartTitle>
        <ChartContainer>
          {loading ? (
            <ChartSkeleton variant="rectangular" width="100%" height="100%" />
          ) : data && data.length > 0 && data[0]?.name !== 'No Data' ? (
            <ResponsivePie
              data={formattedData.map(item => ({
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
              colors={formattedData.map(item => getStatusColor(item.name))}
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
            />
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

export default TaskDistributionChart;