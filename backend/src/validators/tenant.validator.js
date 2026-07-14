const { z } = require('zod');

const roomTypes = ['SINGLE', 'SHARED', 'STUDIO', 'ONE_BHK', 'TWO_BHK', 'OTHER'];

const createTenantProfileSchema = z.object({
  body: z.object({
    preferredLocation: z.string().min(1, 'Preferred location is required').max(100),
    budgetMin: z.coerce.number().int().nonnegative('Minimum budget must be a positive integer'),
    budgetMax: z.coerce.number().int().nonnegative('Maximum budget must be a positive integer'),
    moveInDate: z.coerce.date({ message: 'Invalid move-in date format' }),
    roomTypePreference: z.enum(roomTypes).optional().nullable(),
    furnishedPref: z.boolean().optional().nullable(),
    bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional().nullable(),
  }).refine((data) => data.budgetMax >= data.budgetMin, {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['budgetMax'],
  }),
});

const updateTenantProfileSchema = z.object({
  body: z.object({
    preferredLocation: z.string().min(1).max(100).optional(),
    budgetMin: z.coerce.number().int().nonnegative().optional(),
    budgetMax: z.coerce.number().int().nonnegative().optional(),
    moveInDate: z.coerce.date({ message: 'Invalid move-in date format' }).optional(),
    roomTypePreference: z.enum(roomTypes).optional().nullable(),
    furnishedPref: z.boolean().optional().nullable(),
    bio: z.string().max(1000).optional().nullable(),
  }).refine((data) => {
    if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  }, {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['budgetMax'],
  }),
});

module.exports = {
  createTenantProfileSchema,
  updateTenantProfileSchema,
};
