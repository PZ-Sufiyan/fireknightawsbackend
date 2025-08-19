require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const authRoutes = require('./Auth/routes/authRoutes');
const deviceRoutes = require('./Device/routes/deviceRoutes');
const deviceRegistrationRoutes = require('./DeviceRegistration/routes/deviceRegistrationRoutes');
const alertRoutes = require('./Alerts/routes/alertRoutes');
const settingsRoutes = require('./Settings/routes/settingsRoutes');
const periodicRoutes = require('./PeriodicUpdates/routes/periodicRoutes');
const userRoutes = require('./User/routes/userRoutes');
const heartbeatRoutes = require('./Heartbeat/routes/heartbeatRoutes');

const allowedOrigins = [
  'http://localhost:5000',
  'http://192.168.18.84:5000',
  'http://localhost:5173',
  process.env.CLIENT_URL, // frontend URL from env (Heroku config var)
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/deviceRegistration', deviceRegistrationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/periodicupdates', periodicRoutes);
app.use('/api/users', userRoutes);
app.use('/api/heartbeats', heartbeatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
