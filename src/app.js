const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes/index');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'VJC Invoice API Running!' });
});

module.exports = app;