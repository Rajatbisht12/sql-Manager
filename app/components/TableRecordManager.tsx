'use client';

import React, { useState, useEffect } from 'react';
import '../styles/dbmanager.css';

interface TableRecordManagerProps {
  database: string;
  table: string;
}

export default function TableRecordManager({ database, table }: TableRecordManagerProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [structure, setStructure] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [primaryKey, setPrimaryKey] = useState<string>('id');
  
  // Fetch table structure and records
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First fetch structure to identify primary key
        const structureResponse = await fetch(`/api/tables/${database}/${table}?structure=true`);
        const structureData = await structureResponse.json();
        
        if (structureData.success) {
          setStructure(structureData.structure);
          
          // Find primary key
          const pk = structureData.structure.find((col: any) => col.Key === 'PRI');
          if (pk) {
            setPrimaryKey(pk.Field);
          }
          
          // Now fetch records
          const recordsResponse = await fetch(`/api/tables/${database}/${table}?limit=${limit}&offset=${(page - 1) * limit}`);
          const recordsData = await recordsResponse.json();
          
          if (recordsData.success) {
            setRecords(recordsData.records);
            // Rough estimate for pagination
            setTotalPages(Math.ceil(recordsData.records.length / limit) || 1);
          } else {
            setError(recordsData.message || 'Failed to fetch records');
          }
        } else {
          setError(structureData.message || 'Failed to fetch table structure');
        }
      } catch (error) {
        setError('Failed to fetch table data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [database, table, page, limit]);
  
  const handleAddRecord = () => {
    // Create an empty record based on table structure
    const newRecord: any = {};
    structure.forEach(column => {
      newRecord[column.Field] = '';
    });
    
    setEditingRecord(newRecord);
    setIsNewRecord(true);
  };
  
  const handleEditRecord = (record: any) => {
    setEditingRecord({ ...record });
    setIsNewRecord(false);
  };
  
  const handleDeleteRecord = async (id: any) => {
    if (!confirm(`Are you sure you want to delete this record?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/records/${database}/${table}/${id}?idColumn=${primaryKey}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove record from state
        setRecords(records.filter(record => record[primaryKey] !== id));
        setSuccessMessage('Record deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Failed to delete record');
      }
    } catch (error) {
      setError('Failed to delete record');
    }
  };
  
  const handleChange = (field: string, value: any) => {
    if (editingRecord) {
      setEditingRecord({
        ...editingRecord,
        [field]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isNewRecord) {
        // Create new record
        const response = await fetch('/api/records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            database,
            table,
            data: editingRecord
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Refresh records
          const recordsResponse = await fetch(`/api/tables/${database}/${table}?limit=${limit}&offset=${(page - 1) * limit}`);
          const recordsData = await recordsResponse.json();
          
          if (recordsData.success) {
            setRecords(recordsData.records);
          }
          
          setSuccessMessage('Record created successfully');
          setEditingRecord(null);
        } else {
          setError(data.message || 'Failed to create record');
        }
      } else {
        // Update existing record
        const id = editingRecord[primaryKey];
        const response = await fetch(`/api/records/${database}/${table}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idColumn: primaryKey,
            data: editingRecord
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Update record in state
          setRecords(records.map(record => 
            record[primaryKey] === id ? editingRecord : record
          ));
          
          setSuccessMessage('Record updated successfully');
          setEditingRecord(null);
        } else {
          setError(data.message || 'Failed to update record');
        }
      }
    } catch (error) {
      setError('Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
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
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button 
          className="button"
          onClick={handleAddRecord}
          disabled={!!editingRecord}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Record
        </button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loadingSpinner"></div>
          <p style={{ marginTop: '1rem' }}>Loading records...</p>
        </div>
      ) : records.length === 0 && !editingRecord ? (
        <div className="emptyState">
          <div className="emptyStateIcon">📋</div>
          <p className="emptyStateText">No records found in this table</p>
          <button 
            className="button"
            onClick={handleAddRecord}
          >
            Add Record
          </button>
        </div>
      ) : (
        <>
          {/* Form for editing or adding a record */}
          {editingRecord && (
            <div className="tableContainer" style={{ marginBottom: '2rem', border: '2px solid var(--primary)', boxShadow: 'var(--shadow)' }}>
              <div className="tableHeader" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                <h3 className="tableTitle">{isNewRecord ? 'Add New Record' : 'Edit Record'}</h3>
              </div>
              
              <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
                <div className="tableContainer" style={{ boxShadow: 'none', border: '1px solid var(--gray-200)' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: '30%' }}>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {structure.map((column) => (
                        <tr key={column.Field}>
                          <td>
                            <div style={{ fontWeight: 500 }}>
                              {column.Field}
                              {column.Key === 'PRI' && (
                                <span className="badge badgeSuccess" style={{ marginLeft: '0.5rem' }}>PK</span>
                              )}
                              {column.Null === 'NO' && column.Key !== 'PRI' && (
                                <span className="badge" style={{ marginLeft: '0.5rem' }}>Required</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                              {column.Type}
                            </div>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingRecord[column.Field] || ''}
                              onChange={(e) => handleChange(column.Field, e.target.value)}
                              disabled={isNewRecord ? column.Extra === 'auto_increment' : column.Key === 'PRI'}
                              style={{ 
                                width: '100%', 
                                padding: '0.5rem', 
                                border: '1px solid var(--gray-300)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '0.875rem'
                              }}
                              required={column.Null === 'NO' && column.Extra !== 'auto_increment'}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    type="button"
                    className="button buttonSecondary"
                    onClick={() => setEditingRecord(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loadingSpinner" style={{ marginRight: '0.5rem' }}></div>
                        Saving...
                      </>
                    ) : (
                      'Save Record'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Records table */}
          {(!editingRecord || records.length > 0) && (
            <div className="tableContainer">
              <div className="tableHeader">
                <h3 className="tableTitle">Table Data</h3>
                <div className="dataIndicator">
                  <span className="dataIndicatorDot dataIndicatorDotPrimary"></span>
                  <span>{records.length} records found</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      {structure.map(column => (
                        <th key={column.Field}>{column.Field}</th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={index}>
                        {structure.map(column => (
                          <td key={column.Field}>
                            {record[column.Field] === null ? 'NULL' : String(record[column.Field])}
                          </td>
                        ))}
                        <td>
                          <div className="cardActions">
                            <button 
                              className="button"
                              onClick={() => handleEditRecord(record)}
                              disabled={!!editingRecord}
                            >
                              Edit
                            </button>
                            <button 
                              className="button buttonDanger"
                              onClick={() => handleDeleteRecord(record[primaryKey])}
                              disabled={!!editingRecord}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="paginationButton"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || !!editingRecord}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      className={`paginationButton ${pageNum === page ? 'paginationButtonActive' : ''}`}
                      onClick={() => setPage(pageNum)}
                      disabled={!!editingRecord}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button 
                    className="paginationButton"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || !!editingRecord}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 