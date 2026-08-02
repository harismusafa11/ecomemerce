import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { dash } from '@better-auth/infra';
import prisma from '../server/db.js';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            enabled: true,
        },
    },
    plugins: [
        dash()
    ],
    secret: process.env.BETTER_AUTH_SECRET || 'tapak-pamungkas-auth-secret-key-2026',
    baseURL: process.env.BETTER_AUTH_URL || 'https://tapakpamungkas.my.id',
});
