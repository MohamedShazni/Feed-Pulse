const dotenv = require('dotenv');
// Load env vars
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Default Admin Creation
app.post('/api/auth/setup', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(400).json({ success: false, error: 'Admin user already setup' });
    }
    const admin = await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@feedpulse.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    res.status(201).json({ success: true, message: 'Admin setup complete', email: admin.email });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route files
const feedbackRoutes = require('./src/routes/feedback.routes');
const authRoutes = require('./src/routes/auth.routes');

// Mount routers
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Base route for healthcheck
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Welcome to FeedPulse API' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
