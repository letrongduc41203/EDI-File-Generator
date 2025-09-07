require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const orderRoutes = require('./routes/orders');
const containerRoutes = require('./routes/containers');
const ediRoutes = require('./routes/edi');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(express.static('Views'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/orders', orderRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/edi', ediRoutes);

// Redirect root to Orders page for convenience
app.get('/', (req, res) => {
  res.redirect('/Orders.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
