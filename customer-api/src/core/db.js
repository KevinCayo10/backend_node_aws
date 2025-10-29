import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
console.log(
  process.env.DB_HOST,
  process.env.BD_USER,
  process.env.DB_PASS,
  process.env.DB_NAME,
  process.env.DB_PORT
);
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "12345",
  database: process.env.DB_NAME || "db_store",
  port: Number(process.env.DB_PORT) || 3308,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
