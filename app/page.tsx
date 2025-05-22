'use client';

import React, { useEffect, useState } from 'react';
import ConnectionForm from './components/ConnectionForm';
import DatabaseList from './components/DatabaseList';
import { useConnection } from './context/ConnectionContext';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './styles/dbmanager.css';

export default function Home() {
  const { connected } = useConnection();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user) {
      // Set user role for UI display
      setUserRole((session.user as any).role || 'user');
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="loadingSpinner" style={{ marginRight: '1rem' }}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect in useEffect)
  if (!session) {
    return null;
  }

  return (
    <main className="mainLayout">
      <header className="mainHeader">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="mainTitle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.75rem' }}>
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            MySQL Database Manager
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: 'white', fontSize: '0.875rem' }}>
              Signed in as: {session.user?.name || session.user?.email}
              {userRole && (
                <span className="badge" style={{ 
                  marginLeft: '0.5rem', 
                  backgroundColor: userRole === 'admin' ? 'var(--success-light)' : 'var(--light)',
                  color: userRole === 'admin' ? 'var(--success)' : 'var(--gray-700)'
                }}>
                  {userRole.toUpperCase()}
                </span>
              )}
            </div>
            <button 
              className="button" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <div className="mainContent">
        <div className="container">
          <div className="appLayout">
            <div className="sidePanel">
              <ConnectionForm />
              {userRole !== 'admin' && connected && (
                <div className="status" style={{ 
                  backgroundColor: 'var(--warning-light)', 
                  color: 'var(--warning)',
                  marginTop: '1rem' 
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Read-only mode: Some operations are limited
                </div>
              )}
            </div>
            <div className="mainPanel">
              <DatabaseList />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
