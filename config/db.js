require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const connectMySQL = async () => {
    try {
        await pool.getConnection();
        console.log(' MySQL Conectado');
        return pool;
    } catch (error) {
        console.error('MySQL connection error:', error.message);
        process.exit(1);
    }
};

function getPool(){
  return pool;
}

module.exports = connectMySQL;
module.exports.getPool = getPool;
