const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    role: z.enum(['OWNER', 'TENANT'], {
      errorMap: () => ({ message: 'role must be OWNER or TENANT' }),
    }),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().min(7).max(20).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = { registerSchema, loginSchema };
