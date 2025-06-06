require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors'); // ← AJOUTÉ

const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());              // ← AJOUTÉ
app.use(express.json());

app.use('/api/payment', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
