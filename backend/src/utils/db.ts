import { pool } from '../config/database';

/**
 * Security Helper
 * Ensures that table names and column names only contain safe characters (a-z, 0-9, _).
 * Prevents SQL Injection via identifiers.
 */
const assertIdentifier = (identifier: string): string => {
    if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
        throw new Error(`Security check failed: Invalid identifier "${identifier}"`);
    }
    return `"${identifier}"`; // Wrap in double quotes for Postgres
};

export const db = {
    /**
     * Finds a single record in a table matching the criteria
     */
    findOne: async (table: string, criteria: { [key: string]: any }, columns: string[] = ['*']) => {
        const tableName = assertIdentifier(table);
        const keys = Object.keys(criteria);
        const values = Object.values(criteria);
        
        // Secure column selection
        const selectCols = columns[0] === '*' ? '*' : columns.map(assertIdentifier).join(', ');

        // secure WHERE clause
        const whereClause = keys.map((key, index) => `${assertIdentifier(key)} = $${index + 1}`).join(' AND ');
        
        const query = `SELECT ${selectCols} FROM ${tableName} WHERE ${whereClause} LIMIT 1`;
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error(`Error in findOne [${table}]:`, error);
            throw error;
        }
    },

    /**
     * Generic Insert
     */
    insert: async (table: string, data: { [key: string]: any }) => {
        const tableName = assertIdentifier(table);
        const keys = Object.keys(data);
        const values = Object.values(data);
        
        const indices = keys.map((_, index) => `$${index + 1}`).join(', ');
        const colNames = keys.map(assertIdentifier).join(', ');
        
        const query = `INSERT INTO ${tableName} (${colNames}) VALUES (${indices}) RETURNING *`;
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error(`Error in insert [${table}]:`, error);
            throw error;
        }
    },

    /**
     * Generic Update
     * Defines automatically SET col = $x based on data keys
     */
    update: async (table: string, id: number, data: { [key: string]: any }) => {
        const tableName = assertIdentifier(table);
        // Filter out undefined keys to support partial updates
        const keys = Object.keys(data).filter(k => data[k] !== undefined);
        const values = keys.map(k => data[k]);
        
        if (keys.length === 0) return null; // Nothing to update

        // Build SET clause: "col1 = $1, col2 = $2"
        const setClause = keys.map((key, index) => `${assertIdentifier(key)} = $${index + 1}`).join(', ');
        
        // Add ID as the last parameter
        values.push(id);
        const idParamIndex = values.length;

        const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${idParamIndex} RETURNING *`;

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error(`Error in update [${table}]:`, error);
            throw error;
        }
    },
    
    /**
     * Simple Delete
     */
    delete: async (table: string, criteria: { [key: string]: any }) => {
        const tableName = assertIdentifier(table);
        const keys = Object.keys(criteria);
        const values = Object.values(criteria);
        
        const whereClause = keys.map((key, index) => `${assertIdentifier(key)} = $${index + 1}`).join(' AND ');
        
        const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;
        
        try {
            await pool.query(query, values);
        } catch (error) {
            console.error(`Error in delete [${table}]:`, error);
            throw error;
        }
    }
};
