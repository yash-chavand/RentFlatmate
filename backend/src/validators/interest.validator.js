const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format');

const sendInterestSchema = z.object({
  body: z.object({
    listingId: objectIdSchema,
    message: z.string().max(500, 'Message cannot exceed 500 characters').optional().nullable(),
  }),
});

const interestIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

module.exports = {
  sendInterestSchema,
  interestIdParamSchema,
};
