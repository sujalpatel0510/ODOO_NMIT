'use client'

import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Complete onboarding profile setup', priority: 'high', completed: true, dueDate: 'Today' },
    { id: '2', title: 'Submit monthly attendance reconciliation', priority: 'medium', completed: false, dueDate: 'Tomorrow' },
    { id: '3', title: 'Review medical certificate policy updates', priority: 'low', completed: false, dueDate: 'Next week' },
  ])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        priority: newPriority,
        completed: false,
        dueDate: 'Pending',
      }
    ])
    setNewTaskTitle('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="font-mono-ledger text-xs text-amber font-semibold uppercase tracking-wider">
          Task & Workflow Ledger
        </span>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-ink tracking-tight mt-1">
          Workplace Tasks & Action Items
        </h1>
        <p className="text-xs text-slate mt-0.5">
          Assign, track, and reconcile daily HR and operational task milestones.
        </p>
      </div>

      {/* Add Task Card */}
      <div className="ledger-card p-6 bg-surface">
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Add new task or action item..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 bg-surface border border-border rounded-[6px] px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="bg-surface border border-border rounded-[6px] px-3 py-2 text-xs font-mono-ledger text-ink focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <Button variant="amber" type="submit" size="sm" className="whitespace-nowrap">
            + Add Task
          </Button>
        </form>
      </div>

      {/* Task List */}
      <div className="ledger-card p-6 bg-surface space-y-3">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          Active Tasks ({tasks.filter(t => !t.completed).length})
        </h4>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-center justify-between p-3.5 bg-paper border border-border rounded-[6px] cursor-pointer hover:border-ink transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 rounded border-border text-amber focus:ring-amber cursor-pointer"
                />
                <span className={`text-sm ${task.completed ? 'line-through text-slate' : 'font-medium text-ink'}`}>
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-ledger uppercase font-semibold ${
                  task.priority === 'high'
                    ? 'bg-rose/10 text-rose'
                    : task.priority === 'medium'
                    ? 'bg-amber/10 text-amber'
                    : 'bg-paper text-slate border border-border'
                }`}>
                  {task.priority}
                </span>
                <span className="font-mono-ledger text-xs text-slate">
                  {task.dueDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
