const express = require('express');
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { notificationIdParamSchema } = require('../validators/notification.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', validate(notificationIdParamSchema), notificationController.markAsRead);

module.exports = router;
