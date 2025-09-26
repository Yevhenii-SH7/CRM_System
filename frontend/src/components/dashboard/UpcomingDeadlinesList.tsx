import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import dayjs from 'dayjs';
import { SectionTitle } from '../styled/SharedStyled';

interface DeadlineItem {
  id: number;
  title: string;
  due_date: string;
}

interface UpcomingDeadlinesListProps {
  deadlines: DeadlineItem[];
  loading?: boolean;
}

const UpcomingDeadlinesList = React.memo(({ deadlines, loading }: UpcomingDeadlinesListProps) => {
  return (
    <Card>
      <CardContent>
        <SectionTitle variant="h6" mb={2}>
          Upcoming Deadlines
        </SectionTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                <Skeleton 
                  variant="text" 
                  width="70%" 
                  height={20}
                  sx={{ 
                    borderRadius: 1,
                    visibility: 'visible',
                    contentVisibility: 'auto',
                    containIntrinsicSize: '20px'
                  }}
                />
                <Skeleton 
                  variant="text" 
                  width="40%" 
                  height={16}
                  sx={{ 
                    borderRadius: 1,
                    mt: 0.5,
                    visibility: 'visible',
                    contentVisibility: 'auto',
                    containIntrinsicSize: '16px'
                  }}
                />
              </Box>
            ))
          ) : (
            deadlines.slice(0, 5).map((item) => (
              <Box key={item.id} sx={{ p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography 
                  variant="subtitle2"
                  sx={{
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    fontWeight: 500,
                    visibility: 'visible',
                    contentVisibility: 'auto',
                    containIntrinsicSize: '20px'
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: dayjs(item.due_date).isBefore(dayjs()) ? '#f44336' : 'text.secondary',
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
                  }}
                >
                  {dayjs(item.due_date).format('DD.MM.YYYY')}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

export default UpcomingDeadlinesList;