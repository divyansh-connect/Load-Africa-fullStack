require('dotenv').config();
const app = require('./src/app');
const trackingService = require('./src/services/trackingService');

const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Setup basic Socket.io (Placeholder for future)
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🟢 New client connected: ${socket.id}`);
  
  // Secure booking-specific rooms
  socket.on('join_booking', (bookingId) => {
    socket.join(`booking_${bookingId}`);
    console.log(`Client ${socket.id} joined room booking_${bookingId}`);
  });

  socket.on('leave_booking', (bookingId) => {
    socket.leave(`booking_${bookingId}`);
  });

  // Continuous Location Tracking Service
  socket.on('driver_location_update', async (payload) => {
    try {
      const { bookingId, driverId, lat, lng, speed, heading } = payload;
      
      // Pass the raw GPS to the backend tracking service for validation, geofencing, and ETA updates
      const result = await trackingService.processLocationUpdate({
        bookingId, driverId, lat, lng, speed, heading
      });

      if (result) {
        // Broadcast the validated data strictly to the specific booking room
        io.to(`booking_${bookingId}`).emit('location_update', {
          bookingId,
          lat,
          lng,
          speed,
          heading,
          telemetry: result.telemetry,
          status: result.newStatus
        });
      }
    } catch (error) {
      console.error('Socket Location Update Error:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});
