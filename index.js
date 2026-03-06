require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectMySQL = require('./config/db.js');
const connectMongo = require('./config/mongodb.js');
const vehicleRoutes = require('./routes/vehicle.routes.js');
const historyRoutes = require('./routes/history.routes.js');

const app  = express();

connectMySQL()
connectMongo()

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/history',  historyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
