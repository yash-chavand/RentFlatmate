const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format');

const chatRoomIdParamSchema = z.object({
  params: z.object({
    chatRoomId: objectIdSchema,
  }),
});

module.exports = {
  chatRoomIdParamSchema,
};
