'use client'; // Required in Next.js App Router for state and click handlers

import { useState } from 'react';

export default function Page() {
  // 1. Manage state for inputs and submission status
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 2. Submit data to your Next.js route handler
  const handleSubmit = async () => {
    if (!title) {
      alert('Please enter a task title.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Assumes your route file is located at /app/api/tasks/route.ts
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          date: date ? new Date(date).getTime() : Date.now(), // Match the timestamp structure
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✨ Task added successfully!');
        setTitle(''); // Reset inputs
        setDate('');
      } else {
        setMessage(`Error: ${result.error || 'Failed to create task'}`);
      }
    } catch (error) {
      setMessage('Network error, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-amber-200">
        <h1 className="text-2xl font-bold text-amber-900 mb-6 text-center">Add New Task</h1>
        
        {/* Form Container */}
        <div className="space-y-4">
          <div>
            <label htmlFor="t" className="block text-sm font-semibold text-amber-950 mb-1">
              Task Title
            </label>
            <input
              type="text"
              name="title"
              id="t"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full p-3 border border-amber-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="d" className="block text-sm font-semibold text-amber-950 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="date"
              id="d"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-amber-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow transition duration-200 disabled:bg-amber-300"
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>

          {message && (
            <p className="text-center text-sm font-medium mt-4 text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
