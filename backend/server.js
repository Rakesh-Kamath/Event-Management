import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import seedRoutes from './routes/seedRoutes.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/seed', seedRoutes);

app.use('/api/admin/events', eventRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Evently — Full-Stack Event Management & Ticket Booking Platform Backend',
    timestamp: new Date()
  });
});

process.on('uncaughtException', (err) => {
  console.error('[Backend Uncaught Exception]:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('[Backend Unhandled Rejection]:', err?.message || err);
});

const startServer = async () => {
  const isConnected = await connectDB();
  app.locals.isDbConnected = isConnected;

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Evently Backend running on http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [PORT ${PORT} ALREADY IN USE]: Another node process is currently running on port ${PORT}.`);
      process.exit(1);
    } else {
      console.error('[Server Error]:', err.message);
    }
  });
};

startServer();
