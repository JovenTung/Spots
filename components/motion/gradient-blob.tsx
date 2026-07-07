import { cn } from "@/lib/utils";

/**
 * Ambient blurred gradient blobs (CSS-only — deliberately not WebGL so the
 * map stays the app's only GL context). Parent needs `relative overflow-hidden`.
 */
export const GradientBlob = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-0 overflow-hidden",
      className,
    )}
  >
    <div
      className="absolute -left-24 -top-24 h-80 w-80 rounded-full opacity-60 blur-3xl motion-safe:animate-blob-drift"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, #FF8A7A 0%, rgba(255,138,122,0) 70%)",
      }}
    />
    <div
      className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full opacity-50 blur-3xl motion-safe:animate-blob-drift"
      style={{
        background:
          "radial-gradient(circle at 60% 60%, #9DB5A4 0%, rgba(157,181,164,0) 70%)",
        animationDelay: "-6s",
      }}
    />
    <div
      className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full opacity-40 blur-3xl motion-safe:animate-blob-drift"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #FFE3DF 0%, rgba(255,227,223,0) 70%)",
        animationDelay: "-11s",
      }}
    />
  </div>
);
