'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  date: number;
}

export default function Page() {
  // 1. Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 2. Task list state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // 3. Fetch all tasks from /api/task
  const fetchTasks = async () => {
    try {
      setIsFetching(true);
      setFetchError('');
      const response = await fetch('/api/task');
      if (!response.ok) {
        throw new Error(`Failed to load tasks (Status ${response.status})`);
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Network error fetching tasks.';
      setFetchError(errMessage);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 4. Submit new task
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          date: date ? new Date(date).getTime() : Date.now(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✨ Task added successfully!');
        setTitle('');
        setDate('');
        // Instantly append newly created task to state
        if (result.data) {
          setTasks((prev) => [...prev, result.data]);
        } else {
          fetchTasks();
        }
      } else {
        setMessage(`Error: ${result.error || 'Failed to create task'}`);
      }
    } catch {
      setMessage('Network error, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format timestamps into readable dates
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'No due date';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-amber-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-900 tracking-tight">
            Task Dashboard
          </h1>
          <p className="mt-2 text-sm text-amber-700">
            Create and track your tasks in one place
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Card */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-amber-200">
            <h2 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2">
              <span>✍️</span> Add New Task
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="task-title" className="block text-sm font-semibold text-amber-950 mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full p-3 border border-amber-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="task-date" className="block text-sm font-semibold text-amber-950 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="task-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 border border-amber-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow transition duration-200 disabled:bg-amber-300 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Task'}
              </button>

              {message && (
                <p className="text-center text-sm font-medium mt-4 text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  {message}
                </p>
              )}
            </form>
          </div>

          {/* Right Column: All Tasks List */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-amber-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                  <span>📋</span> All Tasks
                </h2>
                <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
                  {tasks.length}
                </span>
              </div>
              <button
                type="button"
                onClick={fetchTasks}
                disabled={isFetching}
                className="text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition border border-amber-200 flex items-center gap-1 cursor-pointer"
              >
                🔄 Refresh
              </button>
            </div>

            {/* Loading State */}
            {isFetching && tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2"></div>
                <p className="text-sm text-slate-500">Loading tasks...</p>
              </div>
            )}

            {/* Error State */}
            {fetchError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
                <p className="font-semibold">Error loading tasks</p>
                <p>{fetchError}</p>
                <button
                  onClick={fetchTasks}
                  className="mt-2 text-xs font-medium text-red-700 underline hover:text-red-900 cursor-pointer"
                >
                  Click to retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isFetching && !fetchError && tasks.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/50">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-base font-semibold text-amber-950">No tasks yet</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                  Add your first task using the form on the left to get started.
                </p>
              </div>
            )}

            {/* Tasks List */}
            {tasks.length > 0 && (
              <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition duration-150 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-amber-950 break-words">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          📅 {formatDate(task.date)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">ID: {task.id}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
