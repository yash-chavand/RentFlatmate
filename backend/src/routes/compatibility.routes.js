const express = require('express');
const compatibilityController = require('../controllers/compatibility.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { compatibilityParamSchema } = require('../validators/compatibility.validator');

const router = express.Router();

router.get(
  '/:listingId',
  authenticate,
  authorize('TENANT'),
  validate(compatibilityParamSchema),
  compatibilityController.getCompatibility
);

module.exports = router;
