const fs = require('fs');
const path = require('path');
const listingRepository = require('../repositories/listing.repository');
const ownerProfileRepository = require('../repositories/ownerProfile.repository');
const listingImageRepository = require('../repositories/listingImage.repository');
const ApiError = require('../utils/ApiError');

async function createListing(ownerUserId, listingData) {
  const ownerProfile = await ownerProfileRepository.findByUserId(ownerUserId);
  if (!ownerProfile) {
    throw ApiError.forbidden('Only users with an owner profile can create listings. Please create an owner profile first.');
  }

  return listingRepository.create({
    ownerProfileId: ownerProfile.id,
    ...listingData,
  });
}

async function updateListing(ownerUserId, listingId, updateData) {
  const ownerProfile = await ownerProfileRepository.findByUserId(ownerUserId);
  if (!ownerProfile) {
    throw ApiError.forbidden('Access denied. Owner profile not found.');
  }

  const listing = await listingRepository.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  if (listing.ownerProfileId !== ownerProfile.id) {
    throw ApiError.forbidden('You do not own this listing');
  }

  return listingRepository.update(listingId, updateData);
}

async function deleteListing(ownerUserId, listingId) {
  const ownerProfile = await ownerProfileRepository.findByUserId(ownerUserId);
  if (!ownerProfile) {
    throw ApiError.forbidden('Access denied. Owner profile not found.');
  }

  const listing = await listingRepository.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  if (listing.ownerProfileId !== ownerProfile.id) {
    throw ApiError.forbidden('You do not own this listing');
  }

  return listingRepository.delete(listingId);
}

async function markAsFilled(ownerUserId, listingId) {
  const ownerProfile = await ownerProfileRepository.findByUserId(ownerUserId);
  if (!ownerProfile) {
    throw ApiError.forbidden('Access denied. Owner profile not found.');
  }

  const listing = await listingRepository.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  if (listing.ownerProfileId !== ownerProfile.id) {
    throw ApiError.forbidden('You do not own this listing');
  }

  return listingRepository.updateStatus(listingId, 'FILLED');
}

const prisma = require('../config/db');
const tenantProfileRepository = require('../repositories/tenantProfile.repository');
const { computeFallbackCompatibility } = require('../ai/fallback.engine');

async function searchListings(filters, currentUser) {
  const result = await listingRepository.findMany(filters);
  
  if (currentUser && currentUser.role === 'TENANT') {
    const tenantProfile = await tenantProfileRepository.findByUserId(currentUser.id);
    if (tenantProfile) {
      // Fetch cached compatibilities in bulk
      const cached = await prisma.compatibility.findMany({
        where: {
          tenantProfileId: tenantProfile.id,
          listingId: { in: result.listings.map((l) => l.id) },
        },
      });

      const cachedMap = new Map(cached.map((c) => [c.listingId, c]));
      const listingsWithScore = [];

      for (const listing of result.listings) {
        let comp = cachedMap.get(listing.id);
        if (!comp) {
          const fallback = computeFallbackCompatibility(tenantProfile, listing);
          // Write to DB in the background
          prisma.compatibility.create({
            data: {
              tenantProfileId: tenantProfile.id,
              listingId: listing.id,
              score: fallback.score,
              explanation: fallback.explanation,
              pros: fallback.pros,
              cons: fallback.cons,
              source: 'FALLBACK',
            },
          }).catch((err) => {
            // Ignore background write errors
          });

          comp = { score: fallback.score };
        }
        listingsWithScore.push({
          ...listing,
          compatibilityScore: comp.score,
        });
      }

      listingsWithScore.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      result.listings = listingsWithScore;
    }
  }

  return result;
}

async function getListingDetails(listingId) {
  const listing = await listingRepository.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }
  return listing;
}

async function getMyListings(ownerUserId) {
  const ownerProfile = await ownerProfileRepository.findByUserId(ownerUserId);
  if (!ownerProfile) {
    throw ApiError.forbidden('Access denied. Owner profile not found.');
  }
  return listingRepository.findManyByOwnerProfileId(ownerProfile.id);
}

async function addListingImage(ownerUserId, listingId, { url, publicId }) {
  const ownerProfile = await ownerProfileRepository.findByUserId(ownerUserId);
  if (!ownerProfile) {
    throw ApiError.forbidden('Access denied. Owner profile not found.');
  }

  const listing = await listingRepository.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  if (listing.ownerProfileId !== ownerProfile.id) {
    throw ApiError.forbidden('You do not own this listing');
  }

  let finalUrl = url;
  if (url.startsWith('data:image/')) {
    const matches = url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw ApiError.badRequest('Invalid image data format');
    }

    const imageType = matches[1]; // e.g. "image/png"
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const ext = imageType.split('/')[1] || 'png';
    const fileName = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
    const uploadsDir = path.join(__dirname, '../../uploads');

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    finalUrl = `http://localhost:5000/uploads/${fileName}`;
  }

  return listingImageRepository.create({
    listingId,
    url: finalUrl,
    publicId,
  });
}

async function removeListingImage(ownerUserId, listingId, imageId) {
  const ownerProfile = await ownerProfileRepository.findByUserId(ownerUserId);
  if (!ownerProfile) {
    throw ApiError.forbidden('Access denied. Owner profile not found.');
  }

  const listing = await listingRepository.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  if (listing.ownerProfileId !== ownerProfile.id) {
    throw ApiError.forbidden('You do not own this listing');
  }

  const image = await listingImageRepository.findById(imageId);
  if (!image) {
    throw ApiError.notFound('Listing image not found');
  }

  if (image.listingId !== listingId) {
    throw ApiError.badRequest('Image does not belong to this listing');
  }

  return listingImageRepository.delete(imageId);
}

module.exports = {
  createListing,
  updateListing,
  deleteListing,
  markAsFilled,
  searchListings,
  getListingDetails,
  getMyListings,
  addListingImage,
  removeListingImage,
};
