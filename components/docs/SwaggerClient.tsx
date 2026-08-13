"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { Loader2 } from "lucide-react";

// Dynamically import SwaggerUI to prevent SSR issues with DOM
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function SwaggerClient({ spec }: { spec: any }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <span className="ml-3 font-medium">Loading API documentation...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#15181C] rounded-lg border border-surface-border p-6 shadow-xl">
      <SwaggerUI spec={spec} />
    </div>
  );
}
