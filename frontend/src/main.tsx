import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './fonts.css'
import App from './App'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/src/sw.ts')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const prefetchCriticalData = async () => {
  try {
    const { dashboardAPI } = await import('./services/api');
    
    const prefetchWithTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error('Prefetch timeout')), timeoutMs)
        )
      ]);
    };
    
    Promise.allSettled([
      prefetchWithTimeout(dashboardAPI.getSummary(), 3000).catch(() => {}),
      prefetchWithTimeout(dashboardAPI.getRecentTasks(), 3000).catch(() => {}),
      prefetchWithTimeout(dashboardAPI.getActiveProjects(), 3000).catch(() => {})
    ]).then(results => {
      console.log('Prefetch completed with results:', results);
    });
  } catch (error) {
    console.debug('Prefetch initialization error:', error);
  }
};

setTimeout(() => {
  prefetchCriticalData();
}, 0);

const preloadCriticalComponents = async () => {
  try {
    await Promise.allSettled([
      import('./pages/HomePage'),
      import('./components/layout/Header'),
      import('./components/layout/styled/HeaderStyled'),
      import('./components/Dashboard'),
      import('./components/dashboard/MetricCard'),
      import('./components/dashboard/RecentTasksTable'),
      import('./components/dashboard/ActiveProjectsList'),
      import('./components/dashboard/UpcomingDeadlinesList'),
      import('./components/dashboard/QuickActionsPanel')
    ]);
  } catch (error) {
    console.debug('Component preload error:', error);
  }
};

preloadCriticalComponents();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)