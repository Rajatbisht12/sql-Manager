import { NextRequest, NextResponse } from 'next/server';
import { createTable } from '@/app/utils/mysql';

// POST /api/tables - Create a new table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { database, name, columns } = body;
    
    if (!database) {
      return NextResponse.json({ success: false, message: 'Database name is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ success: false, message: 'Table name is required' }, { status: 400 });
    }

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json({ success: false, message: 'At least one column is required' }, { status: 400 });
    }

    const success = await createTable(database, name, columns);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating table:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to create table' 
    }, { status: 500 });
  }
} 