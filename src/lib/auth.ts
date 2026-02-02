import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; // your drizzle instance
import * as schema from '../db/schema/auth'

export const auth = betterAuth({
    // Secret key of better auth
    secret: process.env.BETTER_AUTH_SECRET!,
    // Trusted Origin frontend API
    trustedOrigins: [process.env.FRONTEND_URL!],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            // Role
            role: {
                type: 'string', required: true, default: "student", input: true,
            },
            // Profile Pic
            imageCldPubId: {
                type: 'string', required: false, input: true,
            },
        }
    }
});