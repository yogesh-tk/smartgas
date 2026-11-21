require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigration() {
  console.log('🔄 [MySQL Init] Connecting to MySQL server...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf-8');
    const seedsSql = fs.readFileSync(path.join(__dirname, '../../database/seeds.sql'), 'utf-8');

    console.log('📜 [MySQL Init] Executing schema.sql...');
    await connection.query(schemaSql);
    console.log('✅ [MySQL Init] Database schema initialized successfully.');

    console.log('🌱 [MySQL Init] Executing seeds.sql...');
    await connection.query(seedsSql);
    console.log('✅ [MySQL Init] Initial seed data inserted successfully.');
    console.log('🎉 [MySQL Init] MySQL database setup complete!');
  } catch (err) {
    console.error('❌ [MySQL Init Error]:', err.message);
  } finally {
    await connection.end();
  }
}

runMigration();
