const { sql, poolPromise } = require('../config/db');

async function run(text, paramsBuilder) {
  const pool = await poolPromise;
  const request = pool.request();
  if (typeof paramsBuilder === 'function') {
    paramsBuilder(request, sql);
  }
  return request.query(text);
}

async function getByOrderId(orderId) {
  const result = await run(
    `SELECT ContainerId, OrderId, ContainerNo, SealNo, Weight, CargoType, CreatedAt
     FROM Containers WHERE OrderId = @orderId ORDER BY CreatedAt DESC`,
    (req) => req.input('orderId', sql.Int, orderId)
  );
  return result.recordset;
}

async function create(container) {
  const result = await run(
    `INSERT INTO Containers (OrderId, ContainerNo, SealNo, Weight, CargoType)
     OUTPUT INSERTED.*
     VALUES (@OrderId, @ContainerNo, @SealNo, @Weight, @CargoType)`,
    (req) => {
      req.input('OrderId', sql.Int, container.orderId);
      req.input('ContainerNo', sql.NVarChar(20), container.containerNo);
      req.input('SealNo', sql.NVarChar(50), container.sealNo || null);
      req.input('Weight', sql.Int, container.weight != null ? container.weight : null);
      req.input('CargoType', sql.NVarChar(50), container.cargoType || null);
    }
  );
  return result.recordset[0];
}

async function remove(containerId) {
  await run(
    'DELETE FROM Containers WHERE ContainerId = @id',
    (req) => req.input('id', sql.Int, containerId)
  );
}

module.exports = { getByOrderId, create, remove };
