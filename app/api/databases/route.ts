import { NextResponse } from 'next/server';
import { getDatabases, createDatabase } from '@/app/utils/mysql';

export async function GET() {
  try {
    const databases = await getDatabases();
    return NextResponse.json({ success: true, databases });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get databases' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Database name is required' },
        { status: 400 }
      );
    }
    
    const success = await createDatabase(name);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Database '${name}' created successfully` 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to create database' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create database' },
      { status: 500 }
    );
  }
} 