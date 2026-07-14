const interestRepository = require('../repositories/interest.repository');
const tenantProfileRepository = require('../repositories/tenantProfile.repository');
const ownerProfileRepository = require('../repositories/ownerProfile.repository');
const listingRepository = require('../repositories/listing.repository');
const chatRoomRepository = require('../repositories/chatRoom.repository');
const notificationRepository = require('../repositories/notification.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const emailService = require('./email.service');
const compatibilityService = require('./compatibility.service');

async function sendInterest(tenantUserId, { listingId, message }) {
  const tenantProfile = await tenantProfileRepository.findByUserId(tenantUserId);
  if (!tenantProfile) {
    throw ApiError.notFound('Tenant profile required. Please configure your profile first.');
  }

  const listing = await listingRepository.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  const existing = await interestRepository.findByTenantAndListing(tenantProfile.id, listingId);
  if (existing) {
    throw ApiError.badRequest('You have already sent an interest request to this listing');
  }

  const interest = await interestRepository.create({
    tenantProfileId: tenantProfile.id,
    listingId,
    status: 'PENDING',
    message,
  });

  // Notify the owner
  const ownerUserId = listing.ownerProfile?.userId;
  if (ownerUserId) {
    try {
      await notificationRepository.create({
        userId: ownerUserId,
        type: 'INTEREST_RECEIVED',
        title: 'New Interest Request',
        body: `${tenantProfile.user?.name || 'A tenant'} is interested in your listing "${listing.title}".`,
        metadata: { interestId: interest.id, listingId },
      });

      // Calculate compatibility and send email if compatibility >= 80
      const compatibility = await compatibilityService.getOrComputeCompatibility(tenantUserId, listingId);
      if (compatibility && compatibility.score >= 80) {
        const ownerEmail = listing.ownerProfile?.user?.email;
        if (ownerEmail) {
          await emailService.sendEmail({
            to: ownerEmail,
            subject: `🔥 High Compatibility Interest: ${compatibility.score}% Match!`,
            text: `Hi ${listing.ownerProfile.user.name},\n\nA tenant named ${tenantProfile.user.name} who matches ${compatibility.score}% with your listing "${listing.title}" has just expressed interest!\n\nIntroductory Message: "${message}"\n\nCheck out their profile on your Owner Dashboard!`,
          });
        }
      }
    } catch (err) {
      logger.error('Failed to create notification or email for interest:', err);
    }
  }

  return interest;
}

async function cancelInterest(tenantUserId, interestId) {
  const interest = await interestRepository.findById(interestId);
  if (!interest) {
    throw ApiError.notFound('Interest request not found');
  }

  if (interest.tenantProfile?.userId !== tenantUserId) {
    throw ApiError.forbidden('You are not authorized to cancel this interest request');
  }

  return interestRepository.updateStatus(interestId, 'CANCELLED');
}

async function acceptInterest(ownerUserId, interestId) {
  const interest = await interestRepository.findById(interestId);
  if (!interest) {
    throw ApiError.notFound('Interest request not found');
  }

  if (interest.listing?.ownerProfile?.userId !== ownerUserId) {
    throw ApiError.forbidden('You are not authorized to accept interest on this listing');
  }

  if (interest.status === 'ACCEPTED') {
    throw ApiError.badRequest('This interest request is already accepted');
  }

  const updatedInterest = await interestRepository.updateStatus(interestId, 'ACCEPTED');

  // Auto create chat room
  let chatRoom = await chatRoomRepository.findByInterestRequestId(interestId);
  if (!chatRoom) {
    chatRoom = await chatRoomRepository.create({ interestRequestId: interestId });
  }

  // Notify the tenant
  try {
    await notificationRepository.create({
      userId: interest.tenantProfile?.userId,
      type: 'INTEREST_ACCEPTED',
      title: 'Interest Request Accepted!',
      body: `The owner of "${interest.listing?.title}" accepted your request. A private chat has been opened.`,
      metadata: { interestId, chatRoomId: chatRoom.id },
    });

    const tenantEmail = interest.tenantProfile?.user?.email;
    if (tenantEmail) {
      await emailService.sendEmail({
        to: tenantEmail,
        subject: '🎉 Interest Request Accepted!',
        text: `Hi ${interest.tenantProfile.user.name},\n\nThe owner of "${interest.listing?.title}" has accepted your interest request!\n\nYou can now start chatting with them in real-time in the Chats section.`,
      });
    }
  } catch (err) {
    logger.error('Failed to notify tenant of accepted interest:', err);
  }

  return updatedInterest;
}

async function rejectInterest(ownerUserId, interestId) {
  const interest = await interestRepository.findById(interestId);
  if (!interest) {
    throw ApiError.notFound('Interest request not found');
  }

  if (interest.listing?.ownerProfile?.userId !== ownerUserId) {
    throw ApiError.forbidden('You do not own this listing');
  }

  const updatedInterest = await interestRepository.updateStatus(interestId, 'REJECTED');

  // Notify the tenant
  try {
    await notificationRepository.create({
      userId: interest.tenantProfile?.userId,
      type: 'INTEREST_REJECTED',
      title: 'Interest Request Declined',
      body: `The owner of "${interest.listing?.title}" declined your request.`,
      metadata: { interestId },
    });

    const tenantEmail = interest.tenantProfile?.user?.email;
    if (tenantEmail) {
      await emailService.sendEmail({
        to: tenantEmail,
        subject: 'Update on your Interest Request',
        text: `Hi ${interest.tenantProfile.user.name},\n\nThe owner of "${interest.listing?.title}" has declined your interest request.`,
      });
    }
  } catch (err) {
    logger.error('Failed to notify tenant of declined interest:', err);
  }

  return updatedInterest;
}

async function getSentInterests(tenantUserId) {
  const tenantProfile = await tenantProfileRepository.findByUserId(tenantUserId);
  if (!tenantProfile) return [];
  return interestRepository.findSentByTenant(tenantProfile.id);
}

async function getReceivedInterests(ownerUserId) {
  const ownerProfile = await ownerProfileRepository.findByUserId(ownerUserId);
  if (!ownerProfile) return [];
  return interestRepository.findReceivedByOwner(ownerProfile.id);
}

module.exports = {
  sendInterest,
  cancelInterest,
  acceptInterest,
  rejectInterest,
  getSentInterests,
  getReceivedInterests,
};
