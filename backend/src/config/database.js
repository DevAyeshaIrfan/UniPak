const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || undefined,
    password: process.env.DB_PASSWORD || undefined,
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME || 'UniPak',
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: process.env.DB_VERIFY_CERTIFICATE !== 'true', // Opt in for a verified database certificate
    }
};

// Use Windows Authentication if user and password are not provided
if (!config.user && !config.password) {
    config.options.trustedConnection = true;
    delete config.user;
    delete config.password;
}

let poolPromise = null;

async function getPool() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then(pool => {
                console.log('Connected to SQL Server database');
                return pool;
            })
            .catch(err => {
                console.error('Database connection failed! Bad Config: ', err);
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
}

// Kept as a named connection function because the application entry point
// starts the server only after SQL Server is reachable.
async function connectDB() {
    return getPool();
}

async function query(sqlQuery, params = []) {
    const pool = await getPool();
    const request = pool.request();
    
    params.forEach((val, i) => {
        request.input(`param${i}`, val);
    });
    
    // Replace ? placeholders with @param0, @param1, etc.
    let paramIndex = 0;
    const processedSql = sqlQuery.replace(/\?/g, () => `@param${paramIndex++}`);
    
    return request.query(processedSql);
}

module.exports = {
    connectDB,
    getPool,
    query,
    sql
};
