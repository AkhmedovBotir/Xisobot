const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});


// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/diller', require('./routes/dillerRoutes'));
app.use('/api/sotuvchi', require('./routes/sotuvchiRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Serve static files from uploads directory (for downloads)
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// 404 handler
app.use((req, res) => {
  console.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  // Log error to console
  console.error('Error:', err);
  console.error('Error Stack:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions - don't exit, just log
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION!');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  // Don't exit - let other services continue
  // process.exit(1);
});

// Handle unhandled promise rejections - don't exit, just log
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION!');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  // Don't exit - let other services continue
  // process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start Telegram bots - each bot is isolated, errors won't affect others
  // Use setTimeout to ensure bots start independently
  setTimeout(() => {
    try {
      require('./bots/group-scraping/bot');
      console.log('✅ Group scraping bot started successfully');
    } catch (error) {
      console.error('❌ Failed to start group scraping bot:', error.message);
      console.error('   Other bots will continue to work');
    }
  }, 100);

  setTimeout(() => {
    try {
      require('./bots/diller/bot');
      console.log('✅ Diller bot started successfully');
    } catch (error) {
      console.error('❌ Failed to start Diller bot:', error.message);
      console.error('   Other bots will continue to work');
    }
  }, 200);

  setTimeout(() => {
    try {
      require('./bots/sotuvchi/bot');
      console.log('✅ Sotuvchi bot started successfully');
    } catch (error) {
      console.error('❌ Failed to start Sotuvchi bot:', error.message);
      console.error('   Other bots will continue to work');
    }
  }, 300);
});
