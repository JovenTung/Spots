import { createClient } from "@/lib/supabase/server";
import { BlurText } from "@/components/motion/blur-text";
import { SignOutButton } from "@/components/nav/sign-out-button";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: placeCount }, { count: visitCount }] = await Promise.all([
    supabase.from("places").select("id", { count: "exact", head: true }),
    supabase.from("visits").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="flex flex-col gap-6 px-5 pt-safe">
      <header className="pt-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          <BlurText text="Profile" />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-card p-5 shadow-sm">
          <p className="font-display text-3xl font-semibold text-primary">
            {placeCount ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">spots saved</p>
        </div>
        <div className="rounded-lg bg-card p-5 shadow-sm">
          <p className="font-display text-3xl font-semibold text-secondary">
            {visitCount ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">visits logged</p>
        </div>
      </div>

      <SignOutButton />
    </div>
  );
}
