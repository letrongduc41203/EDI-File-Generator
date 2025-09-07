const { sql, poolPromise } = require('../config/db');

async function run(text, paramsBuilder) {
  const pool = await poolPromise;
  const request = pool.request();
  if (typeof paramsBuilder === 'function') {
    paramsBuilder(request, sql);
  }
  return request.query(text);
}

async function getAll() {
  const result = await run(`
    SELECT o.OrderId, o.OrderNo, o.Customer, o.Port, o.ETA, o.Vessel, o.Voyage, o.Remarks, o.Status, o.CreatedAt,
           COUNT(c.ContainerId) AS ContainerCount
    FROM Orders o
    LEFT JOIN Containers c ON c.OrderId = o.OrderId
    GROUP BY o.OrderId, o.OrderNo, o.Customer, o.Port, o.ETA, o.Vessel, o.Voyage, o.Remarks, o.Status, o.CreatedAt
    ORDER BY o.CreatedAt DESC
  `);
  return result.recordset;
}

async function findById(orderId) {
  const result = await run(
    'SELECT * FROM Orders WHERE OrderId = @orderId',
    (req) => req.input('orderId', sql.Int, orderId)
  );
  return result.recordset[0] || null;
}

async function findByOrderNo(orderNo) {
  const result = await run(
    'SELECT * FROM Orders WHERE OrderNo = @orderNo',
    (req) => req.input('orderNo', sql.NVarChar(50), orderNo)
  );
  return result.recordset[0] || null;
}

async function create(order) {
  const result = await run(
    `INSERT INTO Orders (OrderNo, Customer, Port, ETA, Vessel, Voyage, Remarks, Status)
     OUTPUT INSERTED.*
     VALUES (@OrderNo, @Customer, @Port, @ETA, @Vessel, @Voyage, @Remarks, @Status)`,
    (req) => {
      req.input('OrderNo', sql.NVarChar(50), order.orderNo);
      req.input('Customer', sql.NVarChar(200), order.customer);
      req.input('Port', sql.NVarChar(50), order.port);
      req.input('ETA', sql.DateTime, order.eta ? new Date(order.eta) : null);
      req.input('Vessel', sql.NVarChar(100), order.vessel || null);
      req.input('Voyage', sql.NVarChar(100), order.voyage || null);
      req.input('Remarks', sql.NVarChar(500), order.remarks || null);
      req.input('Status', sql.NVarChar(50), order.status || 'Draft');
    }
  );
  return result.recordset[0];
}

async function updateStatus(orderId, status) {
  const result = await run(
    `UPDATE Orders SET Status = @Status OUTPUT INSERTED.* WHERE OrderId = @OrderId`,
    (req) => {
      req.input('OrderId', sql.Int, orderId);
      req.input('Status', sql.NVarChar(50), status);
    }
  );
  return result.recordset[0];
}

async function remove(orderId) {
  await run(
    'DELETE FROM Orders WHERE OrderId = @orderId',
    (req) => req.input('orderId', sql.Int, orderId)
  );
}

module.exports = {
  getAll,
  findById,
  findByOrderNo,
  create,
  updateStatus,
  remove,
};
