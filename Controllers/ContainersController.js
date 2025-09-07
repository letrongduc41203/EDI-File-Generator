const OrderModel = require('../Models/OrderModel');
const ContainerModel = require('../Models/ContainerModel');

function mapContainer(row) {
  if (!row) return null;
  return {
    id: row.ContainerId,
    orderId: row.OrderId,
    containerNo: row.ContainerNo,
    sealNo: row.SealNo,
    weight: row.Weight,
    cargoType: row.CargoType,
    createdAt: row.CreatedAt ? new Date(row.CreatedAt).toISOString() : null,
  };
}

async function listByOrder(req, res) {
  try {
    const orderId = parseInt(req.query.orderId, 10);
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const containers = await ContainerModel.getByOrderId(orderId);
    res.json(containers.map(mapContainer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch containers' });
  }
}

async function create(req, res) {
  try {
    const { orderId, containerNo, sealNo, weight, cargoType } = req.body;
    if (!orderId || !containerNo) {
      return res.status(400).json({ error: 'orderId and containerNo are required' });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const created = await ContainerModel.create({ orderId, containerNo, sealNo, weight, cargoType });

    // After adding any container, set order status to Ready for EDI
    await OrderModel.updateStatus(orderId, 'Ready for EDI');

    res.status(201).json(mapContainer(created));
  } catch (err) {
    console.error(err);
    // Unique constraint violation for (OrderId, ContainerNo)
    if (err && err.number === 2627) {
      return res.status(409).json({ error: 'ContainerNo already exists for this Order' });
    }
    res.status(500).json({ error: 'Failed to add container' });
  }
}

async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'id is required' });

    // Need orderId to potentially revert status to Draft if no containers left
    // We find container first
    // Since we didn't create a getById on model, do a quick query
    const { query, sql } = require('../config/db');
    const result = await query('SELECT OrderId FROM Containers WHERE ContainerId = @id', (r) => r.input('id', sql.Int, id));
    const row = result.recordset[0];
    await ContainerModel.remove(id);

    if (row && row.OrderId) {
      const remaining = await ContainerModel.getByOrderId(row.OrderId);
      if (remaining.length === 0) {
        await OrderModel.updateStatus(row.OrderId, 'Draft');
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete container' });
  }
}

module.exports = { listByOrder, create, remove };
