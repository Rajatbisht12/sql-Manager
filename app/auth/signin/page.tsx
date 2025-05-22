'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../../styles/dbmanager.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '5rem auto' }}>
      <div className="connectionForm" style={{ marginTop: '2rem' }}>
        <div className="header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            MySQL Database Manager
          </h2>
        </div>
        
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Sign In</h3>
        
        {error && (
          <div className="status statusError">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="button" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loadingSpinner" style={{ marginRight: '0.5rem' }}></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
          <p>Demo Credentials:</p>
          <p>Admin: admin@example.com / adminpassword</p>
          <p>Read-only: readonly@example.com / readonlypassword</p>
        </div>
      </div>
    </div>
  );
} 