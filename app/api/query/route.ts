import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/utils/mysql';

// POST /api/query - Execute a custom SQL query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { database, query } = body;
    
    if (!database) {
      return NextResponse.json({ success: false, message: 'Database name is required' }, { status: 400 });
    }

    if (!query || !query.trim()) {
      return NextResponse.json({ success: false, message: 'SQL query is required' }, { status: 400 });
    }

    // Execute the query in the specified database
    const result = await executeQuery(database, query);
    
    return NextResponse.json({ 
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Error executing query:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to execute query' 
    }, { status: 500 });
  }
} 