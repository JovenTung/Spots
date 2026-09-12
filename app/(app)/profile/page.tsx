import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/nav/sign-out-button";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: placeCount }, { count: visitCount }, { data: members }] =
    await Promise.all([
      supabase.from("places").select("id", { count: "exact", head: true }),
      supabase.from("visits").select("id", { count: "exact", head: true }),
      supabase.from("members").select("user_id, display_name"),
    ]);

  return (
    <div className="flex flex-col gap-7 px-5 pt-safe">
      <header className="pt-7">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {user?.email}
        </p>
      </header>

      <dl className="divide-y divide-border border-y border-border">
        <Stat label="Spots saved" value={placeCount ?? 0} />
        <Stat label="Visits logged" value={visitCount ?? 0} />
      </dl>

      {members && members.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Shared with</h2>
          <p className="text-sm text-muted-foreground">
            Everyone here sees and can edit every spot, visit and photo.
          </p>
          <ul className="mt-1 divide-y divide-border border-y border-border">
            {members.map((m) => (
              <li
                key={m.user_id}
                className="flex items-center justify-between py-3"
              >
                <span>{m.display_name ?? "Unnamed"}</span>
                {m.user_id === user?.id && (
                  <span className="text-sm text-muted-foreground">you</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <SignOutButton />
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-baseline justify-between py-4">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="tabular text-xl font-semibold">{value}</dd>
  </div>
);
