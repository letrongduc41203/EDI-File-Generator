const fs = require('fs');
const path = require('path');
const OrderModel = require('../Models/OrderModel');
const EDIModel = require('../Models/EDIModel');

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
  };
}

async function send(req, res) {
  try {
    const { orderId, fileContent, format, status, responseTime, note } = req.body;
    if (!orderId || !fileContent || !format) {
      return res.status(400).json({ error: 'orderId, fileContent, format are required' });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 1) Write outgoing EDI file to wwwroot/EDI/sent
    const sentDir = path.join(__dirname, '..', 'wwwroot', 'EDI', 'sent');
    const receivedDir = path.join(__dirname, '..', 'wwwroot', 'EDI', 'received');
    if (!fs.existsSync(sentDir)) {
      fs.mkdirSync(sentDir, { recursive: true });
    }
    if (!fs.existsSync(receivedDir)) {
      fs.mkdirSync(receivedDir, { recursive: true });
    }
    const ext = format.toLowerCase() === 'xml' ? 'xml' : 'edi';
    const outFile = path.join(sentDir, `${order.OrderNo}.${ext}`);
    fs.writeFileSync(outFile, fileContent, { encoding: 'utf8' });

    const tx = await EDIModel.create({
      orderId,
      fileContent,
      format,
      status: status || 'Pending',
      sentTime: new Date(),
      responseTime: responseTime ? new Date(responseTime) : null,
      note: note || null,
    });

    // 2) Set order status to Pending immediately
    const updatedOrder = await OrderModel.updateStatus(orderId, 'Pending');

    res.status(201).json({ transaction: tx, order: mapOrder(updatedOrder) });

    // 3) Simulate Customs processing after 5s and accept
    setTimeout(async () => {
      try {
        const responseContent = `<?xml version="1.0" encoding="UTF-8"?>\n<EDI_Response>\n  <OrderNo>${order.OrderNo}</OrderNo>\n  <Status>Accepted</Status>\n  <ProcessedAt>${new Date().toISOString()}</ProcessedAt>\n</EDI_Response>`;
        const responseFile = path.join(receivedDir, `${order.OrderNo}.response.xml`);
        fs.writeFileSync(responseFile, responseContent, { encoding: 'utf8' });

        // Update EDI transaction row as Accepted
        await EDIModel.updateStatus(tx.TransactionId, 'Accepted', new Date(), 'Simulated Accepted');

        await OrderModel.updateStatus(orderId, 'Accepted');
      } catch (e) {
        console.error('Simulated customs processing failed:', e);
      }
    }, 5000);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send EDI' });
  }
}

module.exports = { send };
