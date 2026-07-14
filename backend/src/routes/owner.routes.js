const express = require('express');
const ownerController = require('../controllers/owner.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createOwnerProfileSchema, updateOwnerProfileSchema } = require('../validators/owner.validator');

const router = express.Router();

router.post(
  '/profile',
  authenticate,
  authorize('OWNER'),
  validate(createOwnerProfileSchema),
  ownerController.createProfile
);

router.patch(
  '/profile',
  authenticate,
  authorize('OWNER'),
  validate(updateOwnerProfileSchema),
  ownerController.updateProfile
);

module.exports = router;
