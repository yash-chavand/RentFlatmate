const { z } = require('zod');

const RoomTypeEnum = z.enum(['SINGLE', 'SHARED', 'STUDIO', 'ONE_BHK', 'TWO_BHK', 'OTHER']);

// Helper to validate MongoDB 24-character hexadecimal ObjectId
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format');

const createListingSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    location: z.string().min(1, 'Location is required'),
    rent: z.union([z.number().positive(), z.string().regex(/^\d+$/).transform(Number)]),
    deposit: z.union([z.number().min(0), z.string().regex(/^\d+$/).transform(Number)]).optional().default(0),
    availableDate: z.string().datetime({ message: 'Available date must be a valid ISO date string' }),
    roomType: RoomTypeEnum,
    furnished: z.union([z.boolean(), z.enum(['true', 'false']).transform(v => v === 'true')]).optional().default(false),
  }),
});

const updateListingSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100).optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    location: z.string().min(1, 'Location is required').optional(),
    rent: z.union([z.number().positive(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    deposit: z.union([z.number().min(0), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    availableDate: z.string().datetime({ message: 'Available date must be a valid ISO date string' }).optional(),
    roomType: RoomTypeEnum.optional(),
    furnished: z.union([z.boolean(), z.enum(['true', 'false']).transform(v => v === 'true')]).optional(),
  }),
});

const searchListingsSchema = z.object({
  query: z.object({
    location: z.string().optional(),
    minRent: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxRent: z.string().regex(/^\d+$/).transform(Number).optional(),
    roomType: RoomTypeEnum.optional(),
    furnished: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    availableAfter: z.string().datetime({ message: 'Available date must be a valid ISO date string' }).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  }),
});

const listingIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

const uploadImageSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    url: z.string().min(1, 'A valid image data string is required'),
    publicId: z.string().min(1, 'Cloudinary publicId is required'),
  }),
});

const removeImageSchema = z.object({
  params: z.object({
    id: objectIdSchema,
    imageId: objectIdSchema,
  }),
});

module.exports = {
  createListingSchema,
  updateListingSchema,
  searchListingsSchema,
  listingIdParamSchema,
  uploadImageSchema,
  removeImageSchema,
};
