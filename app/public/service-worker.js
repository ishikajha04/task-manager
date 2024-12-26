// service-worker.js

// Cache versioning
const CACHE_NAME = 'task-manager-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css', // Add your CSS or other static assets if needed
  '/icon.png',    // Icon for notifications
  '/badge.png',   // Badge image for notifications
];

// Install event: Cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching assets during install');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: Cleanup old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of the page immediately
});

// Push event: Handle incoming push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Default Title';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/icon.png',    // Use a default icon for the notification
    badge: data.badge || '/badge.png', // Use a badge image for the notification
    data: {
      url: data.url || '/', // Optional URL to open when clicking the notification
    },
    actions: [
      {
        action: 'open',
        title: 'Open Task Manager',
        icon: '/icon.png',
      },
    ],
  };

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event: Handle clicks on notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification on click

  // Open a specific URL when the notification is clicked
  event.waitUntil(
    clients.openWindow(event.notification.data.url) // Use the URL from notification data
  );
});

// Sync event (optional): Handle background sync (if needed for offline notifications)
self.addEventListener('sync', (event) => {
  if (event.tag === 'syncNewData') {
    event.waitUntil(
      // Implement your background sync logic here
      // For example, syncing data with the backend
      console.log('Syncing data in the background...')
    );
  }
});

// Fetch event: Intercept network requests (for caching and offline functionality)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available or fetch from the network
        return cachedResponse || fetch(event.request);
      })
  );
});
