const express = require('express');
const listingController = require('../controllers/listing.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createListingSchema,
  updateListingSchema,
  searchListingsSchema,
  listingIdParamSchema,
  uploadImageSchema,
  removeImageSchema,
} = require('../validators/listing.validator');

const { optionalAuthenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public / Tenant routes
router.get('/', optionalAuthenticate, validate(searchListingsSchema), listingController.searchListings);
router.get('/:id', validate(listingIdParamSchema), listingController.getListingDetails);

// Protected routes (Owner only)
router.use(authenticate);
router.use(authorize('OWNER'));

router.post('/', validate(createListingSchema), listingController.createListing);
router.get('/me/listings', listingController.getMyListings); // support GET /listings/me/listings
router.patch('/:id', validate(updateListingSchema), listingController.updateListing);
router.delete('/:id', validate(listingIdParamSchema), listingController.deleteListing);
router.patch('/:id/fill', validate(listingIdParamSchema), listingController.markAsFilled);
router.post('/:id/images', validate(uploadImageSchema), listingController.addListingImage);
router.delete('/:id/images/:imageId', validate(removeImageSchema), listingController.removeListingImage);

module.exports = router;
