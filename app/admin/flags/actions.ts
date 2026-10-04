"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { resetFlag, setFlag } from "@/lib/flags";

// Server actions are reachable by direct POST, so each one checks auth.
// setFlag and resetFlag reject names not declared in feature-flags.json.

export async function toggleFlagAction(formData: FormData) {
  await requireAdmin();
  await setFlag(String(formData.get("name")), formData.get("value") === "on");
  // Drop any cached render that might have read the old value.
  revalidatePath("/", "layout");
}

export async function resetFlagAction(formData: FormData) {
  await requireAdmin();
  await resetFlag(String(formData.get("name")));
  revalidatePath("/", "layout");
}
