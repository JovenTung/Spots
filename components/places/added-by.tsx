"use client";

import { useMembers, useCurrentUserId } from "@/lib/queries/members";

type AddedByProps = {
  userId: string;
  /** "Added" for spots, "Visited" for visits. */
  verb?: string;
};

/** Who put this here. Only meaningful once more than one person shares the
 *  space, so it renders nothing while you're the only member. */
export const AddedBy = ({ userId, verb = "Added" }: AddedByProps) => {
  const { data: members } = useMembers();
  const { data: currentUserId } = useCurrentUserId();

  if (!members || Object.keys(members).length < 2) return null;

  const name = userId === currentUserId ? "you" : members[userId];
  if (!name) return null;

  return (
    <span>
      {verb} by {name}
    </span>
  );
};
