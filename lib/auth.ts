import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { createPolarCore } from "@polar-sh/sdk/2026-10";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { activeLicense, grantLicense, revokeLicense } from "@/lib/license";

const PRO_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID!;

const polarClient = createPolarCore({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  environment: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  // memory counters reset on every serverless cold start
  rateLimit: { storage: "database", modelName: "rateLimit" },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/checkout") return;
      const session = await getSessionFromCtx(ctx);
      if (session && (await activeLicense(session.user.id))) {
        throw new APIError("BAD_REQUEST", {
          message: "You already have RareUI Pro.",
        });
      }
    }),
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    polar({
      client: polarClient,
      // checkout creates the polar customer, so a polar outage cannot break sign up
      createCustomerOnSignUp: false,
      use: [
        checkout({
          products: [{ productId: PRO_PRODUCT_ID, slug: "pro" }],
          successUrl: "/account?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onOrderPaid: async ({ data }) => {
            const userId = data.customer.external_id;
            if (data.product_id !== PRO_PRODUCT_ID || !userId) return;
            await grantLicense(userId, data.id);
          },
          onOrderRefunded: async ({ data }) => {
            const userId = data.customer.external_id;
            // a partial refund keeps the license
            if (data.status !== "refunded" || !userId) return;
            if (data.product_id !== PRO_PRODUCT_ID) return;
            await revokeLicense(userId, data.id);
          },
        }),
      ],
    }),
    // must stay last so cookies set inside server actions reach the browser
    nextCookies(),
  ],
});

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
