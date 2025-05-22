import { NextRequest, NextResponse } from 'next/server';
import { deleteDatabase, getTables } from '@/app/utils/mysql';

interface RouteParams {
  params: Promise<{
    name: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { name } = await params;
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Database name is required' },
        { status: 400 }
      );
    }
    
    const tables = await getTables(name);
    
    return NextResponse.json({ 
      success: true, 
      database: name,
      tables 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get tables' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { name } = await params;
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Database name is required' },
        { status: 400 }
      );
    }
    
    const success = await deleteDatabase(name);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Database '${name}' deleted successfully` 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to delete database' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete database' },
      { status: 500 }
    );
  }
} 