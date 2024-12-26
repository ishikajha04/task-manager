// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpush = require('web-push');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Set VAPID details (from environment variables)
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Your email for contact
  process.env.VAPID_PUBLIC_KEY, // VAPID Public Key from .env
  process.env.VAPID_PRIVATE_KEY // VAPID Private Key from .env
);

// In-memory tasks array (for demonstration purposes)
let tasks = [
  { id: 1, title: 'Sample Task 1', description: 'This is a sample task', status: 'pending', dueDate: '2024-12-31' },
  { id: 2, title: 'Sample Task 2', description: 'Another sample task', status: 'completed', dueDate: '2024-12-30' },
];

// API Routes

// Fetch all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Add a new task
app.post('/tasks', (req, res) => {
  const newTask = { id: tasks.length + 1, ...req.body };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update a task (for example, mark as completed)
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(task => task.id == id);

  if (taskIndex > -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(task => task.id != id);
  res.status(204).send();
});

// Subscribe a user to push notifications
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  console.log('User subscribed to push notifications:', subscription);

  // You can save the subscription to your database here if needed.

  res.status(201).send();
});

// Send push notification to all subscribers
app.post('/send-notification', (req, res) => {
  const payload = JSON.stringify(req.body); // Notification content

  // Example of push subscription
  const pushSubscription = {
    endpoint: 'subscriber-endpoint', // You should replace this with the actual endpoint from the subscription object
    keys: {
      p256dh: 'subscriber-p256dh-key',
      auth: 'subscriber-auth-key',
    },
  };

  // Send push notification to the subscriber
  webpush.sendNotification(pushSubscription, payload)
    .then(response => {
      console.log('Push notification sent:', response);
      res.status(200).json({ success: true });
    })
    .catch(error => {
      console.error('Error sending push notification:', error);
      res.status(500).json({ error: 'Failed to send push notification' });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
