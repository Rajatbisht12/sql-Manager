import { NextRequest, NextResponse } from 'next/server';
import { deleteTable, getTableStructure, getRecords } from '@/app/utils/mysql';

interface RouteParams {
  params: Promise<{
    database: string;
    name: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { database, name } = await params;
    const url = request.nextUrl;
    const structure = url.searchParams.get('structure') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    if (!database || !name) {
      return NextResponse.json(
        { success: false, message: 'Database and table names are required' },
        { status: 400 }
      );
    }
    
    if (structure) {
      // Get table structure
      const tableStructure = await getTableStructure(database, name);
      
      return NextResponse.json({ 
        success: true, 
        database,
        table: name,
        structure: tableStructure
      });
    } else {
      // Get table records
      const records = await getRecords(database, name, limit, offset);
      
      return NextResponse.json({ 
        success: true, 
        database,
        table: name,
        records,
        pagination: {
          limit,
          offset,
          total: records.length // In a real app, would get actual total count
        }
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get table data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { database, name } = await params;
    
    if (!database || !name) {
      return NextResponse.json(
        { success: false, message: 'Database and table names are required' },
        { status: 400 }
      );
    }
    
    const success = await deleteTable(database, name);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Table '${name}' deleted successfully from database '${database}'` 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to delete table' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete table' },
      { status: 500 }
    );
  }
} 