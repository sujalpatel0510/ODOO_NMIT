"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { Check, X, Clock, Flag } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  assignedBy: string
  priority: "low" | "medium" | "high"
  dueDate: string
  status: "not-started" | "in-progress" | "completed" | "overdue"
}

export default function TasksPage() {
  const { user } = useAuth()
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("medium")
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Complete Q3 Performance Review",
        description: "Finish performance reviews for all team members",
        assignedBy: "Sarah Johnson",
        priority: "high",
        dueDate: "2024-01-20",
        status: "in-progress",
      },
      {
        id: "2",
        title: "Update Employee Handbook",
        description: "Review and update the company employee handbook",
        assignedBy: "Mike Wilson",
        priority: "medium",
        dueDate: "2024-01-25",
        status: "not-started",
      },
    ]
    setTasks(mockTasks)
  }, [user])

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: "",
      assignedBy: user?.name || "Manager",
      priority: newTaskPriority,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "not-started",
    }
    setTasks([...tasks, newTask])
    setNewTaskTitle("")
  }

  const statusColor = {
    "not-started": "slate",
    "in-progress": "amber",
    completed: "sage",
    overdue: "rose",
  }

  return (
    <div className="p-6 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="font-display font-semibold text-2xl text-ink">Tasks</h1>
          <Check className="h-5 w-5 text-amber" />
        </div>

        {/* Add task form */}
        <div className="bg-surface border border-border rounded-md p-6 mb-6">
          <h2 className="font-display font-semibold text-ink mb-4">New Task</h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            
            <div className="grid grid-cols-3 gap-2">
              <label
                key="1"
                className={`p-2 rounded-md cursor-pointer select-none ${
                  newTaskPriority === "low"
                    ? "border border-amber/50 text-amber bg-amber/5"
                    : "border border-border hover:border-amber"
                }`}
                onClick={() => setNewTaskPriority("low")}
              >
                <Flag className="h-4 w-4" />
              </label>
              <label
                key="2"
                className={`p-2 rounded-md cursor-pointer select-none ${
                  newTaskPriority === "medium"
                    ? "border border-amber/50 text-amber bg-amber/5"
                    : "border border-border hover:border-amber"
                }`}
                onClick={() => setNewTaskPriority("medium")}
              >
                <Clock className="h-4 w-4" />
              </label>
              <label
                key="3"
                className={`p-2 rounded-md cursor-pointer select-none ${
                  newTaskPriority === "high"
                    ? "border border-amber/50 text-amber bg-amber/5"
                    : "border border-border hover:border-amber"
                }`}
                onClick={() => setNewTaskPriority("high")}
              >
                <Flag className="h-4 w-4 rotate-6" />
              </label>
            </div>

            <Button type="submit" onClick={handleAddTask}>
              Add Task
            </Button>
          </form>
        </div>

        {/* Tasks list */}
        <div>
          <h2 className="font-display font-semibold text-ink mb-4">My Tasks</h2>
          
          {tasks.length === 0 && (
            <p className="text-slate text-sm text-center py-8">
              No tasks assigned
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-md border transition-colors ${
                  task.status === "overdue"
                    ? "border-rose bg-rose/5"
                    : task.status === "completed"
                      ? "border-sage bg-sage/5"
                      : "border-border"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display font-medium text-ink">
                    {task.title}{task.status === "completed" && <span className="text-amber/50 line-through">}</span>
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      statusColor[task.status]
                    }`}
                  >
                    {task.status.split("-").map((word, i) => 
                      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(" ")}
                  </span>
                </div>
                
                <p className="text-sm text-slate line-clamp-2">{task.description || "No description"}</p>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <span className="text-amber text-sm font-mono">{task.dueDate}</span>
                  <span className="text-slate text-sm">•</span>
                  <span className="text-slate text-sm">{task.assignedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}