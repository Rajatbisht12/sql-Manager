import { NextRequest, NextResponse } from 'next/server';
import { getRecords, updateRecord, deleteRecord } from '@/app/utils/mysql';

interface RouteParams {
  params: Promise<{
    database: string;
    table: string;
    id: string;
  }>;
}

// GET /api/records/[database]/[table]/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { database, table, id } = await params;
    
    // Get the primary key column name from query parameter or default to 'id'
    const idColumn = request.nextUrl.searchParams.get('idColumn') || 'id';
    
    // We use getRecords with a WHERE clause manually constructed
    const sql = `SELECT * FROM \`${table}\` WHERE \`${idColumn}\` = '${id}' LIMIT 1`;
    const records = await getRecords(database, table);
    
    // Filter the record by ID manually
    const record = records.find((r: any) => r[idColumn] == id);
    
    if (record) {
      return NextResponse.json({ 
        success: true, 
        record
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Record not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching record:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch record' },
      { status: 500 }
    );
  }
}

// PUT /api/records/[database]/[table]/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { database, table, id } = await params;
    const body = await request.json();
    
    // Get the primary key column name from request body or default to 'id'
    const idColumn = body.idColumn || 'id';
    const data = body.data || {};
    
    // Remove empty properties and the ID column to prevent updating the primary key
    const cleanData = Object.fromEntries(
      Object.entries(data)
        .filter(([key, value]) => value !== '' && key !== idColumn)
    );
    
    if (Object.keys(cleanData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No data to update' },
        { status: 400 }
      );
    }
    
    const result = await updateRecord(database, table, id, idColumn, cleanData);
    
    return NextResponse.json({ 
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Error updating record:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update record' },
      { status: 500 }
    );
  }
}

// DELETE /api/records/[database]/[table]/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { database, table, id } = await params;
    
    // Get the primary key column name from query parameter or default to 'id'
    const idColumn = request.nextUrl.searchParams.get('idColumn') || 'id';
    
    const result = await deleteRecord(database, table, id, idColumn);
    
    return NextResponse.json({ 
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete record' },
      { status: 500 }
    );
  }
} 