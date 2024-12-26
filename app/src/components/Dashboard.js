import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', status: 'pending' });

    // Fetch tasks from backend
    useEffect(() => {
        axios.get('http://localhost:5000/tasks')
            .then(response => setTasks(response.data))
            .catch(error => console.error('Error fetching tasks:', error));
    }, []);

    // Handle form submission to add a task
    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/tasks', newTask)
            .then(response => {
                setTasks([...tasks, response.data]); // Update task list
                setNewTask({ title: '', description: '', dueDate: '', status: 'pending' }); // Clear form
            })
            .catch(error => console.error('Error creating task:', error));
    };

    return (
        <div>
            <h1>Task Dashboard</h1>

            {/* Task Creation Form */}
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

            {/* Display Task List */}
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <strong>{task.title}</strong> - {task.status} (Due: {task.dueDate})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;


