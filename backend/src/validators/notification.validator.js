const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format');

const notificationIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

module.exports = {
  notificationIdParamSchema,
};
