import { Pool } from "pg";
import dotenv from 'dotenv';
import path from 'path';
// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
  });