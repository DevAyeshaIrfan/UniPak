const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/universities', require('./routes/universities'));
app.use('/api/calculator', require('./routes/calculator'));
app.use('/api/merit-cutoffs', require('./routes/meritCutoffs'));
app.use('/api/chat', require('./routes/chat'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'UniPak Backend API is running' });
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'UniPak Backend API',
        endpoints: {
            universities: '/api/universities',
            calculator: '/api/calculator',
            meritCutoffs: '/api/merit-cutoffs',
            chat: '/api/chat',
            health: '/api/health'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
