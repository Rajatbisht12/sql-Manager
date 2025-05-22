import { NextRequest, NextResponse } from 'next/server';
import { initConnection } from '@/app/utils/mysql';
import { cookies } from 'next/headers';
import { getServerSession } from "next-auth/next";

// Connection retry logic
async function connectWithRetry(config: any, maxRetries = 3, timeout = 10000) {
  // Get retry parameters from environment variables if available
  const retries = process.env.DB_CONNECTION_RETRIES 
    ? parseInt(process.env.DB_CONNECTION_RETRIES) 
    : maxRetries;
    
  const connectionTimeout = process.env.DB_CONNECTION_TIMEOUT 
    ? parseInt(process.env.DB_CONNECTION_TIMEOUT) 
    : timeout;

  let attempts = 0;
  let lastError;

  while (attempts < retries) {
    try {
      // Set a timeout for the connection attempt
      const connectionPromise = initConnection(config);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Connection timeout after ${connectionTimeout}ms`));
        }, connectionTimeout);
      });

      // Race the connection against the timeout
      const success = await Promise.race([
        connectionPromise,
        timeoutPromise,
      ]);
      
      return success;
    } catch (error: any) {
      lastError = error;
      attempts++;
      console.log(`Connection attempt ${attempts} failed: ${error.message}`);
      
      // Don't wait on the last attempt
      if (attempts < retries) {
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  throw lastError || new Error('Failed to connect after multiple attempts');
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { host, port, user, password, database } = body;
    
    // Validate required fields
    if (!host || !user || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required connection parameters' },
        { status: 400 }
      );
    }

    // Connect to MySQL with retry logic
    try {
      const success = await connectWithRetry({
        host,
        port: port || 3306,
        user,
        password,
        database
      });

      if (success) {
        // Store connection details in a cookie (encrypted in a real app)
        const cookieStore = await cookies();
        
        // Save connection info in cookies
        cookieStore.set('db_host', host);
        cookieStore.set('db_port', port?.toString() || '3306');
        cookieStore.set('db_user', user);
        cookieStore.set('db_database', database || '');
        // Avoid storing the password in cookies in production
        cookieStore.set('db_connected', 'true');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Connected to MySQL server successfully',
          connection: { host, port: port || 3306, user, database }
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Failed to connect to MySQL server' },
          { status: 500 }
        );
      }
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to connect to MySQL server' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get connection information from cookies or use environment defaults
    const cookieStore = await cookies();
    const connected = cookieStore.get('db_connected')?.value === 'true';
    
    if (connected) {
      const host = cookieStore.get('db_host')?.value || process.env.DEFAULT_DB_HOST || '';
      const port = cookieStore.get('db_port')?.value || process.env.DEFAULT_DB_PORT || '3306';
      const user = cookieStore.get('db_user')?.value || process.env.DEFAULT_DB_USER || '';
      const database = cookieStore.get('db_database')?.value || process.env.DEFAULT_DB_NAME || '';
      
      return NextResponse.json({
        success: true,
        connected,
        connection: {
          host,
          port: parseInt(port),
          user,
          database
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      connected: false
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 