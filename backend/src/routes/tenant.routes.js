const express = require('express');
const tenantController = require('../controllers/tenant.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createTenantProfileSchema, updateTenantProfileSchema } = require('../validators/tenant.validator');

const router = express.Router();

router.post(
  '/profile',
  authenticate,
  authorize('TENANT'),
  validate(createTenantProfileSchema),
  tenantController.createProfile
);

router.patch(
  '/profile',
  authenticate,
  authorize('TENANT'),
  validate(updateTenantProfileSchema),
  tenantController.updateProfile
);

router.get(
  '/profile',
  authenticate,
  authorize('TENANT'),
  tenantController.getProfile
);

module.exports = router;
