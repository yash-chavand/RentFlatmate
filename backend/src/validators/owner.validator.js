const { z } = require('zod');

const createOwnerProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional().nullable(),
    govIdUrl: z.string().url('Invalid Government ID URL format').optional().nullable(),
  }),
});

const updateOwnerProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional().nullable(),
    govIdUrl: z.string().url('Invalid Government ID URL format').optional().nullable(),
  }).partial(),
});

module.exports = {
  createOwnerProfileSchema,
  updateOwnerProfileSchema,
};
