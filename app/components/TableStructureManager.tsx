'use client';

import React, { useState, useEffect } from 'react';
import '../styles/dbmanager.css';

interface TableStructureManagerProps {
  database: string;
  table: string;
}

export default function TableStructureManager({ database, table }: TableStructureManagerProps) {
  const [structure, setStructure] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStructure = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/tables/${database}/${table}?structure=true`);
        const data = await response.json();
        
        if (data.success) {
          setStructure(data.structure);
        } else {
          setError(data.message || 'Failed to fetch table structure');
        }
      } catch (error) {
        setError('Failed to fetch table structure');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStructure();
  }, [database, table]);
  
  const keyToLabel = (key: string) => {
    if (key === 'PRI') return { label: 'PRIMARY', className: 'badgeSuccess' };
    if (key === 'UNI') return { label: 'UNIQUE', className: '' };
    if (key === 'MUL') return { label: 'INDEX', className: '' };
    return { label: '', className: '' };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loadingSpinner"></div>
        <p style={{ marginTop: '1rem' }}>Loading table structure...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="status statusError">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h3 className="title">Structure of '{table}'</h3>
      </div>
      
      <div className="tableContainer">
        <div className="tableHeader">
          <h3 className="tableTitle">Table Structure</h3>
          <div className="dataIndicator">
            <span className="dataIndicatorDot dataIndicatorDotPrimary"></span>
            <span>{structure.length} columns defined</span>
          </div>
        </div>
        
        {structure.length === 0 ? (
          <div className="emptyState">
            <div className="emptyStateIcon">📋</div>
            <p className="emptyStateText">No columns defined in this table</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Null</th>
                <th>Key</th>
                <th>Default</th>
                <th>Extra</th>
              </tr>
            </thead>
            <tbody>
              {structure.map((column, index) => (
                <tr key={index}>
                  <td>{column.Field}</td>
                  <td>{column.Type}</td>
                  <td>{column.Null}</td>
                  <td>
                    {column.Key && (
                      <span className={`badge ${keyToLabel(column.Key).className}`}>
                        {keyToLabel(column.Key).label}
                      </span>
                    )}
                    {!column.Key && '-'}
                  </td>
                  <td>{column.Default !== null ? column.Default : 'NULL'}</td>
                  <td>{column.Extra || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="header" style={{ marginTop: '2rem' }}>
        <h3 className="title">SQL Creation Script</h3>
      </div>

      <div className="codeEditor">
        <div className="codeEditorHeader">
          <h4 className="codeEditorTitle">Table Creation SQL</h4>
        </div>
        <div style={{ 
          fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
          fontSize: '0.875rem',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
          color: 'white'
        }}>
          {`CREATE TABLE \`${table}\` (
${structure.map(col => {
  let def = `  \`${col.Field}\` ${col.Type}`;
  if (col.Null === 'NO') def += ' NOT NULL';
  if (col.Default !== null) {
    def += ` DEFAULT ${col.Default === 'CURRENT_TIMESTAMP' ? 'CURRENT_TIMESTAMP' : `'${col.Default}'`}`;
  }
  if (col.Extra) def += ` ${col.Extra.toUpperCase()}`;
  return def;
}).join(',\n')}${
  // Add primary key if exists
  structure.some(col => col.Key === 'PRI') 
    ? ',\n  PRIMARY KEY (`' + structure.find(col => col.Key === 'PRI')?.Field + '`)'
    : ''
}
);`}
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
          Note: To modify table structure, you should create a new table with the desired structure and migrate your data.
          Alternatively, you can use a direct SQL query to alter the table structure.
        </p>
      </div>
    </div>
  );
} 