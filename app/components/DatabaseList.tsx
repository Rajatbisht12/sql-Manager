'use client';

import React, { useState, useEffect } from 'react';
import { useConnection } from '../context/ConnectionContext';
import CreateTableForm from './CreateTableForm';
import TableRecordManager from './TableRecordManager';
import TableStructureManager from './TableStructureManager';
import SqlQueryEditor from './SqlQueryEditor';
import Modal from './Modal';
import '../styles/dbmanager.css';

export default function DatabaseList() {
  const { connected, connection } = useConnection();
  const [databases, setDatabases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [newDbName, setNewDbName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [createDbModalOpen, setCreateDbModalOpen] = useState(false);
  const [tablesModalOpen, setTablesModalOpen] = useState(false);
  const [createTableModalOpen, setCreateTableModalOpen] = useState(false);
  const [recordsModalOpen, setRecordsModalOpen] = useState(false);
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [sqlQueryModalOpen, setSqlQueryModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  const fetchDatabases = async () => {
    if (!connected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/databases');
      const data = await response.json();
      
      if (data.success) {
        setDatabases(data.databases);
      } else {
        setError(data.message || 'Failed to fetch databases');
      }
    } catch (error) {
      setError('Failed to fetch databases');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (connected) {
      fetchDatabases();
    }
  }, [connected]);
  
  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDbName.trim()) return;
    
    setIsCreating(true);
    setCreateError(null);
    
    try {
      const response = await fetch('/api/databases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newDbName }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewDbName('');
        setSuccessMessage(`Database '${newDbName}' created successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchDatabases();
        setCreateDbModalOpen(false);
      } else {
        setCreateError(data.message || 'Failed to create database');
      }
    } catch (error) {
      setCreateError('Failed to create database');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDeleteDatabase = async (name: string) => {
    if (!confirm(`Are you sure you want to delete database '${name}'?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/databases/${name}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`Database '${name}' deleted successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchDatabases();
        if (selectedDb === name) {
          setSelectedDb(null);
          setSelectedTable(null);
          setTablesModalOpen(false);
        }
      } else {
        setError(data.message || 'Failed to delete database');
      }
    } catch (error) {
      setError('Failed to delete database');
    }
  };
  
  const handleSelectDatabase = (name: string) => {
    setSelectedDb(name);
    setTablesModalOpen(true);
  };

  const handleTableCreated = () => {
    setCreateTableModalOpen(false);
    // Refresh table list by toggling the tables modal
    if (selectedDb) {
      setTablesModalOpen(false);
      setTimeout(() => setTablesModalOpen(true), 100);
    }
  };

  const handleViewRecords = (tableName: string) => {
    setSelectedTable(tableName);
    setRecordsModalOpen(true);
  };

  const handleViewStructure = (tableName: string) => {
    setSelectedTable(tableName);
    setStructureModalOpen(true);
  };
  
  if (!connected) {
    return null;
  }
  
  return (
    <div className="container">
      <div className="header">
        <h2 className="title">Databases</h2>
        <div>
          <button 
            className="button"
            onClick={() => setSqlQueryModalOpen(true)}
            style={{ marginRight: '0.5rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <polyline points="9 10 4 15 9 20"></polyline>
              <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
            </svg>
            SQL Query
          </button>
          <button 
            className="button"
            onClick={() => setCreateDbModalOpen(true)}
            style={{ marginRight: '0.5rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Database
          </button>
          <button 
            className="button"
            onClick={fetchDatabases}
          >
            Refresh
          </button>
        </div>
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
      
      {/* Database grid display */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loadingSpinner"></div>
          <p style={{ marginTop: '1rem' }}>Loading databases...</p>
        </div>
      ) : databases.length === 0 ? (
        <div className="emptyState" style={{ padding: '4rem 0' }}>
          <div className="emptyStateIcon">📂</div>
          <p className="emptyStateText">No databases found</p>
          <button className="button" onClick={() => setCreateDbModalOpen(true)}>Create Database</button>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {databases.map(db => (
            <div 
              key={db} 
              className="clickableCard"
              onClick={() => handleSelectDatabase(db)}
            >
              <div className="cardTitle">
                {db}
                {connection?.database === db && (
                  <span className="badge badgeSuccess" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>Connected</span>
                )}
              </div>
              <div className="cardInfo">Click to view tables</div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginTop: '0.75rem'
              }}>
                <button
                  className="button buttonDanger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDatabase(db);
                  }}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Database Modal */}
      <Modal
        title="Create New Database"
        isOpen={createDbModalOpen}
        onClose={() => setCreateDbModalOpen(false)}
        size="small"
      >
        {createError && (
          <div className="status statusError">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {createError}
          </div>
        )}
        
        <form onSubmit={handleCreateDatabase}>
          <div className="formGroup">
            <label htmlFor="newDbName">Database Name</label>
            <input
              type="text"
              id="newDbName"
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value)}
              required
              placeholder="Enter database name"
              autoFocus
            />
          </div>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button 
              type="button" 
              className="button buttonSecondary"
              onClick={() => setCreateDbModalOpen(false)}
            >
              Cancel
            </button>
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
                'Create Database'
              )}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* SQL Query Modal */}
      {selectedDb && (
        <Modal
          title={`SQL Query Editor - Database: ${selectedDb}`}
          isOpen={sqlQueryModalOpen}
          onClose={() => setSqlQueryModalOpen(false)}
          size="large"
        >
          <SqlQueryEditor database={selectedDb} />
        </Modal>
      )}

      {/* Tables Modal */}
      {selectedDb && (
        <Modal
          title={`Tables in '${selectedDb}'`}
          isOpen={tablesModalOpen}
          onClose={() => setTablesModalOpen(false)}
          size="large"
        >
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="button"
              onClick={() => setCreateTableModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Table
            </button>
          </div>
          <TableList 
            database={selectedDb} 
            onViewStructure={handleViewStructure}
            onViewRecords={handleViewRecords}
          />
        </Modal>
      )}

      {/* Create Table Modal */}
      {selectedDb && (
        <Modal
          title={`Create Table in '${selectedDb}'`}
          isOpen={createTableModalOpen}
          onClose={() => setCreateTableModalOpen(false)}
          size="large"
        >
          <CreateTableForm 
            database={selectedDb} 
            onTableCreated={handleTableCreated}
          />
        </Modal>
      )}

      {/* Table Records Modal */}
      {selectedDb && selectedTable && (
        <Modal
          title={`Records in '${selectedDb}.${selectedTable}'`}
          isOpen={recordsModalOpen}
          onClose={() => {
            setRecordsModalOpen(false);
            setSelectedTable(null);
          }}
          size="full"
        >
          <TableRecordManager 
            database={selectedDb} 
            table={selectedTable} 
          />
        </Modal>
      )}

      {/* Table Structure Modal */}
      {selectedDb && selectedTable && (
        <Modal
          title={`Structure of '${selectedDb}.${selectedTable}'`}
          isOpen={structureModalOpen}
          onClose={() => {
            setStructureModalOpen(false);
            setSelectedTable(null);
          }}
          size="large"
        >
          <TableStructureManager
            database={selectedDb}
            table={selectedTable}
          />
        </Modal>
      )}
    </div>
  );
}

interface TableListProps {
  database: string;
  onViewStructure: (tableName: string) => void;
  onViewRecords: (tableName: string) => void;
}

function TableList({ database, onViewStructure, onViewRecords }: TableListProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/databases/${database}`);
        const data = await response.json();
        
        if (data.success) {
          setTables(data.tables);
        } else {
          setError(data.message || 'Failed to fetch tables');
        }
      } catch (error) {
        setError('Failed to fetch tables');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
  }, [database]);
  
  const handleDeleteTable = async (tableName: string) => {
    if (!confirm(`Are you sure you want to delete table '${tableName}'?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tables/${database}/${tableName}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh table list
        setTables(tables.filter(t => t !== tableName));
      } else {
        setError(data.message || 'Failed to delete table');
      }
    } catch (error) {
      setError('Failed to delete table');
    }
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loadingSpinner"></div>
        <p style={{ marginTop: '1rem' }}>Loading tables...</p>
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
  
  if (tables.length === 0) {
    return (
      <div className="emptyState">
        <div className="emptyStateIcon">📋</div>
        <p className="emptyStateText">No tables found in this database</p>
      </div>
    );
  }
  
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
      {tables.map(table => (
        <div key={table} className="clickableCard">
          <div className="cardTitle">{table}</div>
          <div className="cardInfo">Click actions below to view</div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '1rem',
            gap: '0.5rem'
          }}>
            <button 
              className="button"
              onClick={() => onViewRecords(table)}
              style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}
            >
              Records
            </button>
            <button 
              className="button"
              onClick={() => onViewStructure(table)}
              style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}
            >
              Structure
            </button>
            <button 
              className="button buttonDanger"
              onClick={() => handleDeleteTable(table)}
              style={{ padding: '0.5rem', fontSize: '0.75rem' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 