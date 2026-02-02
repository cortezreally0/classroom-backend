import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; // your drizzle instance
import * as schema from '../db/schema/auth'

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!BETTER_AUTH_SECRET) throw new Error("BETTER_AUTH_SECRET is required");
if (!FRONTEND_URL) throw new Error("FRONTEND_URL is required");

export const auth = betterAuth({
    // Secret key of better auth
    secret: BETTER_AUTH_SECRET,
    // Trusted Origin frontend API
    trustedOrigins: [FRONTEND_URL],
    database: drizzleAdapter(db, {
        provider: "pg",
        // add schema API for db find
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
                // For Client side not input what role can be use
                // type: "string", required: true, default: "student", input: false,
            },
            // Profile Pic
            imageCldPubId: {
                type: 'string', required: false, input: true,
            },
        }
    }
});