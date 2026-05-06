import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl">
        <BrandMark />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">ProcureAI</h1>
        <p className="mt-2 text-text-secondary">
          AI-agent-driven procurement that listens where work already happens.
        </p>
        <div className="mt-8 flex flex-col gap-2 text-sm">
          <Link href="/canvas" className="inline-flex items-center gap-2 text-accent hover:text-accent-hover">
            → Design canvas (all 5 surfaces side-by-side)
          </Link>
          <Link href="/dev/primitives" className="inline-flex items-center gap-2 text-accent hover:text-accent-hover">
            → Primitives gallery
          </Link>
        </div>
      </div>
    </main>
  );
}
