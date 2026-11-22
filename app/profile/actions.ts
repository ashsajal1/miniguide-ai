"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/prisma/client";

export type ProfileContextState = { ok: boolean; error?: string } | null;

const MAX_PROFILE_CHARS = 4000;

/** Saves the free-form context that personalises every generated guide. */
export async function saveProfileContext(
  _prev: ProfileContextState,
  formData: FormData
): Promise<ProfileContextState> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Please sign in again." };
  }

  const raw = String(formData.get("profileContext") ?? "").trim();
  if (raw.length > MAX_PROFILE_CHARS) {
    return {
      ok: false,
      error: `Keep it under ${MAX_PROFILE_CHARS} characters.`,
    };
  }

  await prisma.user.upsert({
    where: { clerk_id: userId },
    create: { clerk_id: userId, profile_context: raw || null },
    update: { profile_context: raw || null },
  });

  revalidatePath("/profile");
  revalidatePath("/");

  return { ok: true };
}
