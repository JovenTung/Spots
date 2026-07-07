import { GradientBlob } from "@/components/motion/gradient-blob";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 pb-safe pt-safe">
      <GradientBlob />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </main>
  );
}
