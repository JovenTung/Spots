"use server";

import { createClient } from "@/lib/supabase/server";
import {
  visitIdSchema,
  visitSchema,
  type VisitValues,
} from "@/lib/validation/visit";
import type { VisitRow } from "@/types/database";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const createVisit = async (
  input: VisitValues,
): Promise<ActionResult<VisitRow>> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = visitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid visit",
    };
  }

  // RLS's with-check also blocks visits on places outside the shared space,
  // but verify explicitly for a clean error message.
  const { data: place } = await supabase
    .from("places")
    .select("id")
    .eq("id", parsed.data.place_id)
    .maybeSingle();
  if (!place) return { ok: false, error: "Place not found" };

  const { data, error } = await supabase
    .from("visits")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return { ok: false, error: "Couldn't save this visit" };
  return { ok: true, data: data as VisitRow };
};

export const deleteVisit = async (input: {
  id: string;
}): Promise<ActionResult> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = visitIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid visit" };

  // Storage objects don't cascade — collect paths before the rows go.
  const { data: photoRows } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("visit_id", parsed.data.id);

  const { error } = await supabase
    .from("visits")
    .delete()
    .eq("id", parsed.data.id);

  if (error) return { ok: false, error: "Couldn't delete this visit" };

  // Rows first, then objects — a failed removal leaves invisible orphans
  // rather than rows pointing at deleted objects.
  const paths = (photoRows ?? []).map((row) => row.storage_path);
  if (paths.length > 0) {
    await supabase.storage.from("photos").remove(paths);
  }

  return { ok: true, data: undefined };
};
