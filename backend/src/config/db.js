const { PrismaClient } = require('@prisma/client');
const env = require('./env');

// A single shared PrismaClient instance across the app. Re-instantiating per
// request (or per module) exhausts Postgres connections under load.
const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
