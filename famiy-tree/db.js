import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let connection;

export async function getConnection() {
  if (connection) return connection;

  try {
    // Connect without selecting a DB
    const tempConnection = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
    });

    // Create DB if it doesn't exist
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE}\``);
    await tempConnection.end();

    // Connect to the now-confirmed database
    connection = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
    });

    console.log('✅ Connected to MySQL database');

    // Create users table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Users table is ready');
    return connection;
  } catch (error) {
    console.error('❌ MySQL connection error:', error);
    process.exit(1);
  }
}
