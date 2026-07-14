const { z } = require('zod');

const compatibilityParamSchema = z.object({
  params: z.object({
    listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format'),
  }),
});

module.exports = {
  compatibilityParamSchema,
};
