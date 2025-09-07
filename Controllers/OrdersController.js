const OrderModel = require('../Models/OrderModel');
const ContainerModel = require('../Models/ContainerModel');

function mapOrder(row) {
  if (!row) return null;
  return {
    id: row.OrderId,
    orderNo: row.OrderNo,
    customer: row.Customer,
    port: row.Port,
    eta: row.ETA ? new Date(row.ETA).toISOString() : null,
    vessel: row.Vessel,
    voyage: row.Voyage,
    remarks: row.Remarks,
    status: row.Status,
    createdAt: row.CreatedAt ? new Date(row.CreatedAt).toISOString() : null,
    containerCount: typeof row.ContainerCount === 'number' ? row.ContainerCount : undefined,
  };
}

async function list(req, res) {
  try {
    const orders = await OrderModel.getAll();
    res.json(orders.map(mapOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function create(req, res) {
  try {
    const { orderNo, customer, port, eta, vessel, voyage, remarks } = req.body;
    if (!orderNo || !customer || !port) {
      return res.status(400).json({ error: 'orderNo, customer, port are required' });
    }

    const existing = await OrderModel.findByOrderNo(orderNo);
    if (existing) {
      return res.status(409).json({ error: 'OrderNo already exists' });
    }

    const newOrder = await OrderModel.create({
      orderNo,
      customer,
      port,
      eta,
      vessel,
      voyage,
      remarks,
      status: 'Draft'
    });

    res.status(201).json(mapOrder(newOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    await OrderModel.remove(id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
}

async function updateStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const updated = await OrderModel.updateStatus(id, status);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
}

module.exports = { list, create, remove, updateStatus };
