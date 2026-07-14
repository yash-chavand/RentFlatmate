const express = require('express');
const authRoutes = require('./auth.routes');
const listingRoutes = require('./listing.routes');
const compatibilityRoutes = require('./compatibility.routes');
const ownerRoutes = require('./owner.routes');
const tenantRoutes = require('./tenant.routes');
const interestRoutes = require('./interest.routes');
const notificationRoutes = require('./notification.routes');
const messageRoutes = require('./message.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/compatibility', compatibilityRoutes);
router.use('/owners', ownerRoutes);
router.use('/tenants', tenantRoutes);
router.use('/interests', interestRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
