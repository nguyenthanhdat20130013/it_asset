require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');

const app = express();

/**
 * Security Middleware Configuration
 */
app.use(helmet()); // Set security HTTP headers
app.use(xss()); // Sanitize data against XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Trust proxy is required when running behind Nginx/Docker to get real IP
app.set('trust proxy', 1);

/**
 * Rate Limiting Configuration
 * Limits requests to 1000 per 15 minutes per IP
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Enable CORS for all routes
app.use(cors());

// Body parser, reading data from body into req.body, with size limit
app.use(express.json({ limit: '10kb' }));

/**
 * Health Check Route
 * @route GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Import Route Handlers
const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const departmentsRoutes = require('./routes/departments');
const employeesRoutes = require('./routes/employees');
const assetsRoutes = require('./routes/assets');
const simsRoutes = require('./routes/sims');
const eventsRoutes = require('./routes/events');
const tasksRoutes = require('./routes/tasks');
const reportsRoutes = require('./routes/reports');
const deviceTypesRoutes = require('./routes/deviceTypes');
const softwareRoutes = require('./routes/software');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/sims', simsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/projects', require('./routes/projects'));
app.use('/api/device-types', deviceTypesRoutes);
app.use('/api/software', softwareRoutes);
app.use('/api/backup', require('./routes/backup'));
app.use('/api/reports', reportsRoutes);
app.use('/api/users', require('./routes/users'));

/**
 * Global Error Handling Middleware
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong!'
            : err.message
    });
});

const PORT = process.env.PORT || 3000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
