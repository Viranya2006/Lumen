import { getApiDocs } from "@/lib/swagger";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, BookOpen, Code2, Loader2 } from "lucide-react";

const SwaggerClient = dynamic(() => import("@/components/docs/SwaggerClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3 bg-surface border border-surface-border rounded-xl">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
      <p className="text-sm font-medium">Loading OpenAPI Interactive Swagger Console...</p>
    </div>
  ),
});

export const metadata = {
  title: "API Documentation | Lumen Marketplace",
  description: "Interactive OpenAPI 3.0 documentation for Lumen smart contract API endpoints",
};

export default function ApiDocsPage() {
  const spec = getApiDocs();

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">API Documentation</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Interactive Swagger UI for querying Lumen contract state and real-time event analytics on Sepolia testnet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/doc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-surface border border-surface-border hover:border-accent/40 rounded-md transition-all text-foreground"
          >
            <Code2 className="w-4 h-4 text-accent" />
            View OpenAPI JSON Spec
          </a>
        </div>
      </div>

      <SwaggerClient spec={spec} />
    </div>
  );
}
