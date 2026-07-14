const express = require('express');
const interestController = require('../controllers/interest.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { sendInterestSchema, interestIdParamSchema } = require('../validators/interest.validator');

const router = express.Router();

router.use(authenticate);

// Sent / Received collections lists
router.get('/sent', authorize('TENANT'), interestController.getSentInterests);
router.get('/received', authorize('OWNER'), interestController.getReceivedInterests);

// Tenant Actions
router.post(
  '/',
  authorize('TENANT'),
  validate(sendInterestSchema),
  interestController.sendInterest
);

router.patch(
  '/:id/cancel',
  authorize('TENANT'),
  validate(interestIdParamSchema),
  interestController.cancelInterest
);

// Owner Actions
router.patch(
  '/:id/accept',
  authorize('OWNER'),
  validate(interestIdParamSchema),
  interestController.acceptInterest
);

router.patch(
  '/:id/reject',
  authorize('OWNER'),
  validate(interestIdParamSchema),
  interestController.rejectInterest
);

module.exports = router;
