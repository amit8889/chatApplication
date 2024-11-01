const { createPool } = require("mysql2/promise");
const { createLiveTable } = require("../common/table")
let pool;
const connectSql = async () => {
    const sslOptions = {
        ca: process.env.CERTIFICATE,
    rejectUnauthorized: false   
      };

      const uri = process.env.DB_URL;
      const fields = new URL(uri);
      
      // Parse connection fields
      const host = fields.hostname;
      const port = fields.port;
      const user = fields.username;
      const password = fields.password;
      const database = fields.pathname.replace('/', '');
    
    pool = createPool({
        host,
        port,
        user,
        password,
        database,
        ssl: sslOptions
    });


    pool.on('acquire', (connection) => {
        console.log("====================connection acquire ==================== : ", connection.threadId);

    })
    pool.on('connection', (connection) => {
        console.log("====================connection created ==================== : ", connection.threadId);
        // set read lock onlly commited data will read
        // connection.query('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED') 
        // connection.query("SET AUTOCOMMIT = 1")

    })
    pool.on('release', (connection) => {
        console.log("====================connection released ==================== : ", connection.threadId);
    })
    pool.on('enqueue', () => {
        console.log("====================waiting for avaliable connection ====================");

    })
    await createLiveTable(pool)

};

const getConnection = async () => {
    if (!pool) {
        throw new Error("MySQL connection pool is not initialized");
    }
    return await pool.getConnection();
};

const getPool = () => {
    return pool;
};

module.exports = { connectSql, getConnection, getPool };