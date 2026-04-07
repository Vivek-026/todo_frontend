import React, { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

console.log(API);

function App() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API}/tasks`)
      const data = await res.json()
      setTasks(data)
    } catch {
      setError('Failed to fetch tasks')
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required')
    setError('')
    setLoading(true)
    try {
      if (editId) {
        await fetch(`${API}/tasks/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        setEditId(null)
      } else {
        await fetch(`${API}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      setForm({ title: '', description: '', status: 'pending' })
      await fetchTasks()
    } catch {
      setError('Failed to save task')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await fetch(`${API}/tasks/${id}`, { method: 'DELETE' })
      await fetchTasks()
    } catch {
      setError('Failed to delete task')
    }
  }

  const handleEdit = (task) => {
    setEditId(task._id)
    setForm({ title: task.title, description: task.description || '', status: task.status })
  }

  const cancelEdit = () => {
    setEditId(null)
    setForm({ title: '', description: '', status: 'pending' })
  }

  const statusColor = { pending: '#f59e0b', 'in-progress': '#3b82f6', completed: '#10b981' }

  return (
    <div className="container">
      <h1>Task Manager</h1>

      <form onSubmit={handleSubmit} className="task-form">
        <h2>{editId ? 'Edit Task' : 'Add New Task'}</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Task title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <div className="form-buttons">
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : editId ? 'Update Task' : 'Add Task'}</button>
          {editId && <button type="button" onClick={cancelEdit} className="cancel-btn">Cancel</button>}
        </div>
      </form>

      <div className="task-list">
        <h2>Tasks ({tasks.length})</h2>
        {tasks.length === 0 && <p className="empty">No tasks yet. Add one above!</p>}
        {tasks.map((task) => (
          <div key={task._id} className="task-card">
            <div className="task-header">
              <span className="task-title">{task.title}</span>
              <span className="status-badge" style={{ background: statusColor[task.status] }}>
                {task.status}
              </span>
            </div>
            {task.description && <p className="task-desc">{task.description}</p>}
            <div className="task-actions">
              <button onClick={() => handleEdit(task)} className="edit-btn">Edit</button>
              <button onClick={() => handleDelete(task._id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
