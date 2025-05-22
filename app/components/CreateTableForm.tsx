'use client';

import React, { useState } from 'react';
import '../styles/dbmanager.css';

interface CreateTableFormProps {
  database: string;
  onTableCreated: () => void;
}

interface ColumnDefinition {
  name: string;
  type: string;
  length: string;
  notNull: boolean;
  isPrimary: boolean;
  autoIncrement: boolean;
  default: string;
}

const DATA_TYPES = [
  'INT', 'VARCHAR', 'TEXT', 'DATE', 'DATETIME', 'TIMESTAMP', 
  'FLOAT', 'DOUBLE', 'DECIMAL', 'BOOLEAN', 'ENUM', 'JSON'
];

export default function CreateTableForm({ database, onTableCreated }: CreateTableFormProps) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<ColumnDefinition[]>([
    {
      name: 'id',
      type: 'INT',
      length: '',
      notNull: true,
      isPrimary: true,
      autoIncrement: true,
      default: ''
    }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleAddColumn = () => {
    setColumns([...columns, {
      name: '',
      type: 'VARCHAR',
      length: '255',
      notNull: false,
      isPrimary: false,
      autoIncrement: false,
      default: ''
    }]);
  };
  
  const handleColumnChange = (index: number, field: keyof ColumnDefinition, value: any) => {
    const updatedColumns = [...columns];
    
    if (field === 'isPrimary' && value === true) {
      // Only one primary key allowed
      updatedColumns.forEach((col, i) => {
        if (i !== index) {
          col.isPrimary = false;
        }
      });
    }
    
    updatedColumns[index] = {
      ...updatedColumns[index],
      [field]: value
    };
    
    setColumns(updatedColumns);
  };
  
  const handleRemoveColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsCreating(true);
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!tableName.trim()) {
      setError('Table name is required');
      setIsCreating(false);
      return;
    }
    
    if (columns.some(col => !col.name.trim())) {
      setError('All columns must have a name');
      setIsCreating(false);
      return;
    }
    
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          database,
          name: tableName,
          columns
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Table '${tableName}' created successfully`);
        
        // Reset form
        setTableName('');
        setColumns([
          {
            name: 'id',
            type: 'INT',
            length: '',
            notNull: true,
            isPrimary: true,
            autoIncrement: true,
            default: ''
          }
        ]);
        
        // Notify parent
        onTableCreated();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(data.message || 'Failed to create table');
      }
    } catch (err) {
      setError('Failed to create table');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="connectionForm">
      <div className="header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
          Create New Table in '{database}'
        </h2>
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
      
      {success && (
        <div className="status statusSuccess">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label htmlFor="tableName">Table Name</label>
          <input
            type="text"
            id="tableName"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
            required
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0' }}>Columns</h3>
          
          <div className="tableContainer" style={{ margin: '0 0 1rem 0' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Name</th>
                  <th style={{ width: '20%' }}>Type</th>
                  <th style={{ width: '10%' }}>Length</th>
                  <th style={{ width: '15%' }}>Default</th>
                  <th style={{ width: '25%' }}>Attributes</th>
                  <th style={{ width: '10%' }}></th>
                </tr>
              </thead>
              <tbody>
                {columns.map((column, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                        placeholder="Column name"
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          border: '1px solid var(--gray-300)',
                          borderRadius: 'var(--border-radius)',
                          fontSize: '0.875rem'
                        }}
                        required
                      />
                    </td>
                    <td>
                      <select
                        value={column.type}
                        onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          border: '1px solid var(--gray-300)',
                          borderRadius: 'var(--border-radius)',
                          fontSize: '0.875rem'
                        }}
                        required
                      >
                        {DATA_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={column.length}
                        onChange={(e) => handleColumnChange(index, 'length', e.target.value)}
                        placeholder="Length"
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          border: '1px solid var(--gray-300)',
                          borderRadius: 'var(--border-radius)',
                          fontSize: '0.875rem'
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={column.default}
                        onChange={(e) => handleColumnChange(index, 'default', e.target.value)}
                        placeholder="Default"
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          border: '1px solid var(--gray-300)',
                          borderRadius: 'var(--border-radius)',
                          fontSize: '0.875rem'
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <input
                            type="checkbox"
                            checked={column.notNull}
                            onChange={(e) => handleColumnChange(index, 'notNull', e.target.checked)}
                          />
                          NOT NULL
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <input
                            type="checkbox"
                            checked={column.isPrimary}
                            onChange={(e) => handleColumnChange(index, 'isPrimary', e.target.checked)}
                          />
                          PRIMARY KEY
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <input
                            type="checkbox"
                            checked={column.autoIncrement}
                            onChange={(e) => handleColumnChange(index, 'autoIncrement', e.target.checked)}
                          />
                          AUTO INCREMENT
                        </label>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button buttonDanger"
                        onClick={() => handleRemoveColumn(index)}
                        disabled={columns.length === 1}
                        style={{
                          padding: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button
            type="button"
            className="button buttonSecondary"
            onClick={handleAddColumn}
            style={{ marginRight: '1rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Column
          </button>
        </div>
        
        <div style={{ marginTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="button" 
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <div className="loadingSpinner" style={{ marginRight: '0.5rem' }}></div>
                Creating...
              </>
            ) : (
              'Create Table'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 