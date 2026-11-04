import { promises as fs } from 'fs';
import * as path from 'path';
import { NextRequest, NextResponse } from 'next/server';

interface Task {
  id: number;
  title: string;
  date: number;
}

// Point to db.json at the project root
const getFilePath = () => path.join(process.cwd(), 'db.json');

async function readTasks(): Promise<Task[]> {
  const filePath = getFilePath();
  try {
    const fileData = await fs.readFile(filePath, 'utf8');
    if (!fileData.trim()) return [];
    return JSON.parse(fileData);
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const tasks = await readTasks();
    const newTask: Task = {
      id: Date.now(),
      title: body.title.trim(),
      date: body.date || Date.now(),
    };

    tasks.push(newTask);
    await fs.writeFile(getFilePath(), JSON.stringify(tasks, null, 2), 'utf8');

    return NextResponse.json({ message: 'Task created successfully', data: newTask }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tasks = await readTasks();
    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 });
  }
}