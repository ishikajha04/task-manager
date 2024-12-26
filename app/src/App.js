import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import Axios for HTTP requests

const App = () => {
  const [tasks, setTasks] = useState([]);  // State for tasks
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending',
  });
  const [aiInsights, setAiInsights] = useState(null); // State for AI insights

  // Fetch tasks from backend when the component mounts
  useEffect(() => {
    axios
      .get('http://localhost:5000/tasks')  // Fetch tasks from backend
      .then((response) => {
        setTasks(response.data);  // Update state with fetched tasks
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);  // Log any error
      });
    
    // Fetch AI insights
    axios
      .get('http://localhost:5000/ai-insights')  // Fetch AI insights from backend
      .then((response) => {
        setAiInsights(response.data);  // Update state with AI insights
      })
      .catch((error) => {
        console.error('Error fetching AI insights:', error);  // Log any error
      });
  }, []);  // Empty array ensures this runs once after the component mounts

  // Handle form submission to add a new task
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    axios
      .post('http://localhost:5000/tasks', newTask)  // Send new task data to backend
      .then((response) => {
        setTasks([...tasks, response.data]);  // Add new task to task list
        setNewTask({ title: '', description: '', dueDate: '', status: 'pending' });  // Clear form
      })
      .catch((error) => {
        console.error('Error creating task:', error);  // Log any error
      });
  };

  // Handle task update
  const handleUpdateTask = (id, updatedData) => {
    axios
      .put(`http://localhost:5000/tasks/${id}`, updatedData)
      .then((response) => {
        setTasks(tasks.map(task => task.id === id ? response.data : task));
      })
      .catch((error) => {
        console.error('Error updating task:', error);
      });
  };

  // Handle task delete
  const handleDeleteTask = (id) => {
    axios
      .delete(`http://localhost:5000/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
      });
  };

  // Filter tasks by status
  const filterTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  // Filter tasks by due date
  const filterTasksByDueDate = (dueDate) => {
    return tasks.filter(task => new Date(task.dueDate).toLocaleDateString() === new Date(dueDate).toLocaleDateString());
  };

  // Request notification permission and subscribe for push notifications
  const subscribeToPushNotifications = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array('BIKxxV2UZubfQ3qyNkRw5TjjWuDWLryLdauinxs3qnMNDpItBsgesb2us8MLCsNPN5n6_m5K25a6_B8kCE5acAc'), // Replace with your VAPID public key
    });

    console.log('Push subscription:', subscription);
    // Send the subscription details to the backend
    axios.post('http://localhost:5000/subscribe', subscription)
      .then((response) => {
        console.log('Subscription sent to backend');
      })
      .catch((error) => {
        console.error('Error subscribing to push notifications:', error);
      });
  };

  // Convert the VAPID public key to the correct format
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
        subscribeToPushNotifications();  // Subscribe for push notifications
      } else {
        console.error('Notification permission denied');
      }
    }
  };

  // Fetch AI insights for the user
  const requestAiInsights = async () => {
    // Assuming your backend provides AI insights for productivity and task management
    axios
      .get('http://localhost:5000/ai-insights') // API to get AI insights
      .then((response) => {
        setAiInsights(response.data); // Store insights in state
      })
      .catch((error) => {
        console.error('Error fetching AI insights:', error);
      });
  };

  // Effect hook to request notification permission and fetch AI insights on load
  useEffect(() => {
    requestNotificationPermission();
    requestAiInsights();
  }, []);

  return (
    <div>
      <h1>Task Dashboard</h1>

      {/* Task creation form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
            <strong>{task.title}</strong> - {task.status} (Due: {task.dueDate})
            <button onClick={() => handleUpdateTask(task.id, { status: 'completed' })}>
              Mark as Completed
            </button>
            <button onClick={() => handleDeleteTask(task.id)}>
              Delete Task
            </button>
          </li>
        ))}
      </ul>

      <div>
        <h2>Due Today</h2>
        <ul>
          {filterTasksByDueDate(new Date()).map(task => (
            <li key={task.id}>{task.title} - {task.status}</li>
          ))}
        </ul>

        <h2>Completed Tasks</h2>
        <ul>
          {filterTasksByStatus('completed').map(task => (
            <li key={task.id}>{task.title} - {task.dueDate}</li>
          ))}
        </ul>

        <h2>Overdue Tasks</h2>
        <ul>
          {filterTasksByDueDate(new Date()).map(task => (
            <li key={task.id}>{task.title} - {task.dueDate}</li>
          ))}
        </ul>
      </div>

      {/* AI Insights */}
      <div>
        <h2>AI Insights</h2>
        {aiInsights ? (
          <div>
            <p><strong>Optimal Work Hours:</strong> {aiInsights.optimalHours}</p>
            <p><strong>Productivity Suggestions:</strong> {aiInsights.suggestions}</p>
          </div>
        ) : (
          <p>Loading AI insights...</p>
        )}
      </div>
    </div>
  );
};

export default App;
