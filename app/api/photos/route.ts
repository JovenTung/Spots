import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB hard cap (client compresses to ~1MB)
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

const uploadFieldsSchema = z.object({
  visit_id: z.string().uuid(),
});

export const POST = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const parsed = uploadFieldsSchema.safeParse({
    visit_id: formData.get("visit_id"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid visit" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Photos must be under 10MB" },
      { status: 400 },
    );
  }

  // Ownership check — RLS would also block, but fail with a clear error.
  const { data: visit } = await supabase
    .from("visits")
    .select("id")
    .eq("id", parsed.data.visit_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  // Magic-byte sniff — never trust the client's declared MIME type.
  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = await fileTypeFromBuffer(buffer);
  if (!sniffed || !ALLOWED_MIMES.has(sniffed.mime)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or WebP images are allowed" },
      { status: 400 },
    );
  }

  const path = `${user.id}/${parsed.data.visit_id}/${crypto.randomUUID()}.${sniffed.ext}`;
  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(path, buffer, { contentType: sniffed.mime, upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: photo, error: insertError } = await supabase
    .from("photos")
    .insert({
      visit_id: parsed.data.visit_id,
      user_id: user.id,
      storage_path: path,
    })
    .select()
    .single();
  if (insertError) {
    // Roll the orphaned object back so storage stays consistent.
    await supabase.storage.from("photos").remove([path]);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ photo }, { status: 201 });
};

export const DELETE = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid photo" }, { status: 400 });
  }

  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_path")
    .eq("id", parsed.data)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  await supabase.storage.from("photos").remove([photo.storage_path]);
  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", photo.id)
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
};
