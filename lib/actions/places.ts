"use server";

import { createClient } from "@/lib/supabase/server";
import {
  placeIdSchema,
  placeSchema,
  placeUpdateSchema,
  type PlaceValues,
} from "@/lib/validation/place";
import type { PlaceRow } from "@/types/database";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const createPlace = async (
  input: PlaceValues,
): Promise<ActionResult<PlaceRow>> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid place data" };

  const { data, error } = await supabase
    .from("places")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return { ok: false, error: "Couldn't save this spot" };
  return { ok: true, data: data as PlaceRow };
};

export const updatePlace = async (
  input: PlaceValues & { id: string },
): Promise<ActionResult<PlaceRow>> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = placeUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid place data" };

  const { id, ...values } = parsed.data;
  const { data, error } = await supabase
    .from("places")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) return { ok: false, error: "Couldn't update this spot" };
  return { ok: true, data: data as PlaceRow };
};

export const markVisited = async (input: {
  id: string;
}): Promise<ActionResult> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = placeIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid place" };

  const { error } = await supabase
    .from("places")
    .update({ status: "visited" })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, error: "Couldn't update this spot" };
  return { ok: true, data: undefined };
};

export const deletePlace = async (input: {
  id: string;
}): Promise<ActionResult> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = placeIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid place" };

  // FK cascades remove visit/photo rows but not storage objects, so collect
  // this place's photo paths before the rows disappear.
  const { data: photoRows } = await supabase
    .from("photos")
    .select("storage_path, visits!inner(place_id)")
    .eq("visits.place_id", parsed.data.id);

  const { error } = await supabase
    .from("places")
    .delete()
    .eq("id", parsed.data.id);

  if (error) return { ok: false, error: "Couldn't delete this spot" };

  // Rows first, then objects — a failed removal leaves invisible orphans
  // rather than rows pointing at deleted objects.
  const paths = (photoRows ?? []).map((row) => row.storage_path);
  if (paths.length > 0) {
    await supabase.storage.from("photos").remove(paths);
  }

  return { ok: true, data: undefined };
};
