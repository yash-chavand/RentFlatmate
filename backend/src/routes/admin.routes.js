const express = require('express');
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

// Enforce auth and ADMIN role for all routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', adminController.getUsers);
router.get('/listings', adminController.getListings);
router.get('/logs', adminController.getLogs);
router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.delete('/listings/:id', adminController.deleteListing);

module.exports = router;
