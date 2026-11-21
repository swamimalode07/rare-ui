"use server";

import { getSession } from "@/lib/auth";
import { rotateToken } from "@/lib/license";

export async function createToken() {
  const session = await getSession();
  if (!session) return null;
  return rotateToken(session.user.id);
}
