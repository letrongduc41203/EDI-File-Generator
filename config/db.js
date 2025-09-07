const sql = require('mssql/msnodesqlv8');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'EDI_Customs',
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  },
  driver: 'msnodesqlv8'
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Kết nối SQL Server thành công');
    return pool;
  })
  .catch(err => {
    console.error('Lỗi kết nối SQL Server:', err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise
};