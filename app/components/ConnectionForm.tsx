'use client';

import React, { useState } from 'react';
import { useConnection } from '../context/ConnectionContext';
import '../styles/dbmanager.css';

export default function ConnectionForm() {
  const { connect, connected, connection, loading, error, disconnect } = useConnection();
  
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || '' : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { host, port, user, password, database } = formData;
    await connect(host, port as number, user, password, database);
  };
  
  if (connected) {
    return (
      <div className="connectionForm">
        <div className="header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Connected to MySQL</h2>
            <div className="dataIndicator" style={{ marginTop: '0.25rem' }}>
              <span className="dataIndicatorDot dataIndicatorDotSuccess"></span>
              <span>Connection active</span>
            </div>
          </div>
          <button 
            className="button buttonSecondary" 
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
        
        <div className="tableContainer" style={{ marginTop: '1rem', boxShadow: 'none' }}>
          <table className="table">
            <tbody>
              <tr>
                <td style={{ fontWeight: 500, width: '120px' }}>Host</td>
                <td>{connection?.host}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Port</td>
                <td>{connection?.port}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>User</td>
                <td>{connection?.user}</td>
              </tr>
              {connection?.database && (
                <tr>
                  <td style={{ fontWeight: 500 }}>Database</td>
                  <td>{connection.database}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  return (
    <div className="connectionForm">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 0 }}>Connect to MySQL Server</h2>
      
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
          <label htmlFor="host">Host</label>
          <input
            type="text"
            id="host"
            name="host"
            value={formData.host}
            onChange={handleChange}
            placeholder="localhost"
            required
          />
        </div>
        
        <div className="formGroup">
          <label htmlFor="port">Port</label>
          <input
            type="number"
            id="port"
            name="port"
            value={formData.port}
            onChange={handleChange}
            placeholder="3306"
            required
          />
        </div>
        
        <div className="formGroup">
          <label htmlFor="user">Username</label>
          <input
            type="text"
            id="user"
            name="user"
            value={formData.user}
            onChange={handleChange}
            placeholder="root"
            required
          />
        </div>
        
        <div className="formGroup">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>
        
        <div className="formGroup">
          <label htmlFor="database">Database (optional)</label>
          <input
            type="text"
            id="database"
            name="database"
            value={formData.database}
            onChange={handleChange}
            placeholder="Leave blank to show all databases"
          />
        </div>
        
        <button 
          type="submit" 
          className="button" 
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <div className="loadingSpinner" style={{ marginRight: '0.5rem' }}></div>
              Connecting...
            </>
          ) : (
            'Connect to MySQL'
          )}
        </button>
      </form>
    </div>
  );
} 