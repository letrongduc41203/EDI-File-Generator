const { sql, poolPromise } = require('../config/db');

async function run(text, paramsBuilder) {
  const pool = await poolPromise;
  const request = pool.request();
  if (typeof paramsBuilder === 'function') {
    paramsBuilder(request, sql);
  }
  return request.query(text);
}

async function create(transaction) {
  const result = await run(
    `INSERT INTO EDITransactions (OrderId, FileContent, Format, Status, SentTime, ResponseTime, Note)
     OUTPUT INSERTED.*
     VALUES (@OrderId, @FileContent, @Format, @Status, @SentTime, @ResponseTime, @Note)`,
    (req) => {
      req.input('OrderId', sql.Int, transaction.orderId);
      req.input('FileContent', sql.NVarChar(sql.MAX), transaction.fileContent);
      req.input('Format', sql.NVarChar(20), transaction.format);
      req.input('Status', sql.NVarChar(50), transaction.status);
      req.input('SentTime', sql.DateTime, transaction.sentTime ? new Date(transaction.sentTime) : new Date());
      req.input('ResponseTime', sql.DateTime, transaction.responseTime ? new Date(transaction.responseTime) : null);
      req.input('Note', sql.NVarChar(200), transaction.note || null);
    }
  );
  return result.recordset[0];
}

async function getByOrderId(orderId) {
  const result = await run(
    `SELECT * FROM EDITransactions WHERE OrderId = @orderId ORDER BY CreatedAt DESC`,
    (req) => req.input('orderId', sql.Int, orderId)
  );
  return result.recordset;
}

module.exports = { create, getByOrderId };

async function updateStatus(transactionId, status, responseTime, note) {
  const result = await run(
    `UPDATE EDITransactions
     SET Status = @Status,
         ResponseTime = @ResponseTime,
         Note = @Note
     OUTPUT INSERTED.*
     WHERE TransactionId = @TransactionId`,
    (req) => {
      req.input('TransactionId', sql.Int, transactionId);
      req.input('Status', sql.NVarChar(50), status);
      req.input('ResponseTime', sql.DateTime, responseTime ? new Date(responseTime) : new Date());
      req.input('Note', sql.NVarChar(200), note || null);
    }
  );
  return result.recordset[0];
}

module.exports.updateStatus = updateStatus;
