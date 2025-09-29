/// <reference lib="webworker" />

// Service Worker for prefetching critical resources
const CACHE_NAME = 'crm-prefetch-v3';
const urlsToPrefetch = [
  '/src/components/Dashboard.tsx',
  '/src/pages/Dashboard.tsx',
  '/src/components/MyTasks.tsx',
  '/src/components/Projects.tsx',
  '/src/components/Clients.tsx',
  '/src/pages/Calendar.tsx',
  '/src/components/dashboard/MetricCard.tsx',
  '/src/components/dashboard/RecentTasksTable.tsx',
  '/src/components/dashboard/ActiveProjectsList.tsx',
  '/src/components/dashboard/UpcomingDeadlinesList.tsx',
  '/src/components/dashboard/QuickActionsPanel.tsx',
  '/src/components/styled/SharedStyled.tsx',
  '/src/theme.ts',
  '/src/fonts.css',
  '/src/pages/HomePage.tsx',
  '/src/components/layout/Header.tsx',
  '/src/components/layout/styled/HeaderStyled.tsx',
  '/src/pages/HomePage.module.css',
  '/src/contexts/AuthContext.tsx',
];

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/crm_task_planner';
const API_ENDPOINT = `${API_BASE_URL}/api.php`;

// Additional API endpoints to prefetch
const apiEndpoints = [
  `${API_ENDPOINT}?action=dashboard_summary`,
  `${API_ENDPOINT}?action=recent_tasks`,
  `${API_ENDPOINT}?action=active_projects`,
  `${API_ENDPOINT}?action=dashboard_charts`,
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Prefetching critical resources');
        try {
          // Prefetch static resources
          await cache.addAll(urlsToPrefetch);
          
          // Prefetch critical API data (with credentials if needed)
          const apiRequests = apiEndpoints.map(url => 
            fetch(url, { 
              mode: 'cors',
              credentials: 'include'
            }).catch(err => {
              console.warn('Failed to prefetch API data:', url, err);
              return null;
            })
          );
          
          const responses = await Promise.all(apiRequests);
          const validResponses = responses.filter(r => r !== null);
          
          // Cache API responses
          for (let i = 0; i < validResponses.length; i++) {
            if (validResponses[i]) {
              cache.put(apiEndpoints[i], validResponses[i].clone());
            }
          }
        } catch (error) {
          console.warn('Prefetching failed:', error);
        }
      })
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  // Only cache GET requests to avoid caching POST/PUT/DELETE requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline mode
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('', { status: 503, statusText: 'Offline' });
      })
  );
});