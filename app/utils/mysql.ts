import mysql from 'mysql2/promise';

export interface ConnectionConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

// Create and store a connection pool
let pool: mysql.Pool | null = null;

// Initialize connection
export async function initConnection(config: ConnectionConfig): Promise<boolean> {
  try {
    if (pool) {
      await pool.end();
    }

    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('MySQL connection error:', error);
    return false;
  }
}

// Get all databases
export async function getDatabases(): Promise<string[]> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    const [rows] = await pool.query('SHOW DATABASES');
    
    if (Array.isArray(rows)) {
      return rows.map((row: any) => row.Database);
    }
    return [];
  } catch (error) {
    console.error('Error getting databases:', error);
    throw error;
  }
}

// Create a new database
export async function createDatabase(name: string): Promise<boolean> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`CREATE DATABASE IF NOT EXISTS \`${name}\``);
    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

// Delete a database
export async function deleteDatabase(name: string): Promise<boolean> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`DROP DATABASE IF EXISTS \`${name}\``);
    return true;
  } catch (error) {
    console.error('Error deleting database:', error);
    throw error;
  }
}

// Get all tables in a database
export async function getTables(database: string): Promise<string[]> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`USE \`${database}\``);
    const [rows] = await pool.query('SHOW TABLES');
    
    if (Array.isArray(rows)) {
      const tableKey = `Tables_in_${database}`;
      return rows.map((row: any) => row[tableKey]);
    }
    return [];
  } catch (error) {
    console.error('Error getting tables:', error);
    throw error;
  }
}

// Get table structure
export async function getTableStructure(database: string, table: string): Promise<any[]> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`USE \`${database}\``);
    const [rows] = await pool.query(`DESCRIBE \`${table}\``);
    return rows as any[];
  } catch (error) {
    console.error('Error getting table structure:', error);
    throw error;
  }
}

// Create table
export async function createTable(database: string, table: string, columns: any[]): Promise<boolean> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`USE \`${database}\``);
    
    const columnDefinitions = columns
      .map(col => {
        let def = `\`${col.name}\` ${col.type}`;
        if (col.length) def += `(${col.length})`;
        if (col.notNull) def += ' NOT NULL';
        if (col.isPrimary) def += ' PRIMARY KEY';
        if (col.autoIncrement) def += ' AUTO_INCREMENT';
        if (col.default !== undefined && col.default !== null) {
          def += ` DEFAULT ${col.default === 'NULL' ? 'NULL' : `'${col.default}'`}`;
        }
        return def;
      })
      .join(', ');
    
    await pool.query(`CREATE TABLE IF NOT EXISTS \`${table}\` (${columnDefinitions})`);
    return true;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

// Delete table
export async function deleteTable(database: string, table: string): Promise<boolean> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`USE \`${database}\``);
    await pool.query(`DROP TABLE IF EXISTS \`${table}\``);
    return true;
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
}

// Get records from table
export async function getRecords(database: string, table: string, limit = 100, offset = 0): Promise<any[]> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`USE \`${database}\``);
    const [rows] = await pool.query(`SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`, [limit, offset]);
    return rows as any[];
  } catch (error) {
    console.error('Error getting records:', error);
    throw error;
  }
}

// Insert record
export async function insertRecord(database: string, table: string, data: Record<string, any>): Promise<any> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`USE \`${database}\``);
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const query = `INSERT INTO \`${table}\` (\`${keys.join('`, `')}\`) VALUES (${placeholders})`;
    const [result] = await pool.query(query, values);
    return result;
  } catch (error) {
    console.error('Error inserting record:', error);
    throw error;
  }
}

// Update record
export async function updateRecord(
  database: string, 
  table: string, 
  id: string | number, 
  idColumn: string, 
  data: Record<string, any>
): Promise<any> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`USE \`${database}\``);
    const setClause = Object.keys(data)
      .map(key => `\`${key}\` = ?`)
      .join(', ');
    
    const values = [...Object.values(data), id];
    const query = `UPDATE \`${table}\` SET ${setClause} WHERE \`${idColumn}\` = ?`;
    
    const [result] = await pool.query(query, values);
    return result;
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
}

// Delete record
export async function deleteRecord(
  database: string, 
  table: string, 
  id: string | number, 
  idColumn: string
): Promise<any> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`USE \`${database}\``);
    const [result] = await pool.query(`DELETE FROM \`${table}\` WHERE \`${idColumn}\` = ?`, [id]);
    return result;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
}

// Execute custom query
export async function executeQuery(database: string, query: string): Promise<any> {
  if (!pool) throw new Error('Database not connected');
  
  try {
    await pool.query(`USE \`${database}\``);
    const [result] = await pool.query(query);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
} 