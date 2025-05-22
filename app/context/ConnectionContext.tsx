'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ConnectionState {
  connected: boolean;
  connection: {
    host: string;
    port: number;
    user: string;
    database: string;
  } | null;
  loading: boolean;
  error: string | null;
}

interface ConnectionContextType extends ConnectionState {
  connect: (host: string, port: number, user: string, password: string, database?: string) => Promise<boolean>;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionState>({
    connected: false,
    connection: null,
    loading: true,
    error: null
  });

  // Check connection status on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/connection');
        const data = await response.json();
        
        if (data.success && data.connected) {
          setState({
            connected: true,
            connection: data.connection,
            loading: false,
            error: null
          });
        } else {
          setState({
            connected: false,
            connection: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        setState({
          connected: false,
          connection: null,
          loading: false,
          error: 'Failed to check connection status'
        });
      }
    };

    checkConnection();
  }, []);

  // Connect to database
  const connect = async (host: string, port: number, user: string, password: string, database?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host,
          port,
          user,
          password,
          database
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setState({
          connected: true,
          connection: data.connection,
          loading: false,
          error: null
        });
        return true;
      } else {
        setState({
          connected: false,
          connection: null,
          loading: false,
          error: data.message || 'Failed to connect to database'
        });
        return false;
      }
    } catch (error) {
      setState({
        connected: false,
        connection: null,
        loading: false,
        error: 'Failed to connect to database'
      });
      return false;
    }
  };

  // Disconnect from database
  const disconnect = () => {
    setState({
      connected: false,
      connection: null,
      loading: false,
      error: null
    });
    
    // Clear connection cookies on client side
    document.cookie = 'db_connected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'db_host=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'db_port=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'db_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'db_database=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  return (
    <ConnectionContext.Provider
      value={{
        ...state,
        connect,
        disconnect
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
} 