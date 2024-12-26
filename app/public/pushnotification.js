// pushNotification.js
const subscribeToPushNotifications = async () => {
    // Check if the browser supports push notifications and service workers
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;
  
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array('BIKxxV2UZubfQ3qyNkRw5TjjWuDWLryLdauinxs3qnMNDpItBsgesb2us8MLCsNPN5n6_m5K25a6_B8kCE5acAc') // Replace with your actual VAPID public key
        });
  
        console.log('Push subscription:', subscription);
  
        // Send the subscription object to the backend
        await axios.post('http://localhost:5000/subscribe', subscription);
  
        console.log('Subscription sent to backend');
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
      }
    } else {
      console.error('Push notifications are not supported in this browser.');
    }
  };
  
  // Utility function to convert the VAPID public key to the required format
  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
  
    return outputArray;
  }
  
  // Request notification permission from the user
  const requestNotificationPermission = async () => {
    if ('Notification' in window && navigator.serviceWorker) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        // After permission is granted, subscribe to push notifications
        subscribeToPushNotifications();
      } else {
        console.error('Notification permission denied');
      }
    }
  };
  
  // Check if the service worker is already registered
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
  
        // Request notification permission after service worker registration
        requestNotificationPermission();
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
  
  