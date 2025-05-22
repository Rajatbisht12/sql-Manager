import { NextRequest, NextResponse } from 'next/server';
import { insertRecord } from '@/app/utils/mysql';

// POST /api/records - Create a new record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { database, table, data } = body;
    
    if (!database) {
      return NextResponse.json({ success: false, message: 'Database name is required' }, { status: 400 });
    }

    if (!table) {
      return NextResponse.json({ success: false, message: 'Table name is required' }, { status: 400 });
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ success: false, message: 'Data object is required' }, { status: 400 });
    }

    // Remove empty properties
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '')
    );
    
    const result = await insertRecord(database, table, cleanData);
    
    return NextResponse.json({ 
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Error creating record:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to create record' 
    }, { status: 500 });
  }
} 