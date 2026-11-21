import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cliToken, license } from "@/lib/db/schema";

const TOKEN_PREFIX = "rup_";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// polar repeats and reorders webhooks, so a refund seen before its payment must stay revoked
export async function grantLicense(userId: string, polarOrderId: string) {
  await db
    .insert(license)
    .values({ id: randomUUID(), userId, polarOrderId })
    .onConflictDoNothing({ target: license.polarOrderId });
}

export async function revokeLicense(userId: string, polarOrderId: string) {
  const revokedAt = new Date();
  await db
    .insert(license)
    .values({
      id: randomUUID(),
      userId,
      polarOrderId,
      status: "revoked",
      revokedAt,
    })
    .onConflictDoUpdate({
      target: license.polarOrderId,
      set: { status: "revoked", revokedAt },
    });
}

export async function activeLicense(userId: string) {
  const [row] = await db
    .select()
    .from(license)
    .where(and(eq(license.userId, userId), eq(license.status, "active")))
    .orderBy(asc(license.createdAt))
    .limit(1);
  return row ?? null;
}

export async function hasPurchased(userId: string) {
  const [row] = await db
    .select({ id: license.id })
    .from(license)
    .where(eq(license.userId, userId))
    .limit(1);
  return Boolean(row);
}

export async function tokenPrefix(userId: string) {
  const [row] = await db
    .select({ prefix: cliToken.tokenPrefix })
    .from(cliToken)
    .where(eq(cliToken.userId, userId))
    .limit(1);
  return row?.prefix ?? null;
}

export async function rotateToken(userId: string) {
  if (!(await activeLicense(userId))) return null;

  const token = TOKEN_PREFIX + randomBytes(32).toString("base64url");
  const values = {
    tokenHash: hashToken(token),
    tokenPrefix: token.slice(0, TOKEN_PREFIX.length + 6),
    createdAt: new Date(),
  };
  await db
    .insert(cliToken)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: cliToken.userId, set: values });
  return token;
}

export async function licenseFromRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token.startsWith(TOKEN_PREFIX)) return null;

  const [row] = await db
    .select({ userId: cliToken.userId })
    .from(cliToken)
    .where(eq(cliToken.tokenHash, hashToken(token)))
    .limit(1);
  return row ? activeLicense(row.userId) : null;
}
