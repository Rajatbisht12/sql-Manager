'use client';

import React, { useState } from 'react';
import '../styles/dbmanager.css';

interface SqlQueryEditorProps {
  database: string;
}

export default function SqlQueryEditor({ database }: SqlQueryEditorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          database,
          query
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add to history
        setQueryHistory([query, ...queryHistory.slice(0, 9)]);
        
        if (Array.isArray(data.result)) {
          // Extract column names from first result
          if (data.result.length > 0) {
            setColumns(Object.keys(data.result[0]));
            setResults(data.result);
            setSuccessMessage(`Query executed successfully - ${data.result.length} rows returned`);
          } else {
            setColumns([]);
            setResults([]);
            setSuccessMessage('Query executed successfully - No rows returned');
          }
        } else if (typeof data.result === 'object') {
          // Likely an INSERT, UPDATE, DELETE operation
          setColumns([]);
          setResults([]);
          const affectedRows = data.result.affectedRows || 0;
          setSuccessMessage(`Query executed successfully - ${affectedRows} rows affected`);
        }
      } else {
        setError(data.message || 'Failed to execute query');
      }
    } catch (error) {
      setError('Failed to execute query');
    } finally {
      setLoading(false);
    }
  };
  
  const handleHistorySelect = (historicalQuery: string) => {
    setQuery(historicalQuery);
    setShowHistory(false);
  };
  
  return (
    <div>
      <div className="header">
        <h3 className="title">SQL Query Editor</h3>
      </div>
      
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
      
      {successMessage && (
        <div className="status statusSuccess">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="codeEditor">
          <div className="codeEditorHeader">
            <h4 className="codeEditorTitle">SQL Query for Database: {database}</h4>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter SQL query here..."
            rows={6}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              width: '100%',
              padding: '0.5rem',
              fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
              fontSize: '0.875rem',
              resize: 'vertical',
              outline: 'none'
            }}
            autoFocus
          />
        </div>
        
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <button 
            type="submit" 
            className="button" 
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <>
                <div className="loadingSpinner" style={{ marginRight: '0.5rem' }}></div>
                Executing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                  <polyline points="9 10 4 15 9 20"></polyline>
                  <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                </svg>
                Execute Query
              </>
            )}
          </button>
          
          {queryHistory.length > 0 && (
            <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                type="button" 
                className="button buttonSecondary"
                onClick={() => setShowHistory(!showHistory)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                History
              </button>
              {showHistory && (
                <div style={{ 
                  position: 'absolute', 
                  right: 0,
                  backgroundColor: 'white',
                  minWidth: '250px',
                  zIndex: 1000,
                  boxShadow: 'var(--shadow)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--gray-200)',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', fontWeight: 500 }}>
                    Recent Queries
                  </div>
                  {queryHistory.map((historyItem, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleHistorySelect(historyItem)}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: index < queryHistory.length - 1 ? '1px solid var(--gray-200)' : 'none',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {historyItem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </form>
      
      <style jsx global>{`
        .show {
          display: block !important;
        }
      `}</style>
      
      {results.length > 0 && (
        <div className="tableContainer" style={{ marginTop: '2rem' }}>
          <div className="tableHeader">
            <h3 className="tableTitle">Query Results</h3>
            <div className="dataIndicator">
              <span className="dataIndicatorDot dataIndicatorDotSuccess"></span>
              <span>{results.length} rows returned</span>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex === 0 ? 'highlight' : ''}>
                    {columns.map((column) => (
                      <td key={column}>
                        {row[column] === null ? 'NULL' : String(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 