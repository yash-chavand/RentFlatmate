const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const routes = require('./routes');
const { globalLimiter } = require('./middlewares/rateLimiter.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false, // allows frontend to render backend hosted images
}));
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // required so the refresh-token cookie is sent/received
  })
);
app.use(express.json({ limit: '10mb' })); // support larger payload sizes for base64 image strings
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(globalLimiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OK', uptime: process.uptime() });
});

app.use('/api/v1', routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
