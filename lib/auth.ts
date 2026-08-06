import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { dash } from '@better-auth/infra';
import prisma from '../server/db.js';

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
if (!BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is required');
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    plugins: [
        dash()
    ],
    secret: BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || 'https://tapakpamungkas.my.id',
});
