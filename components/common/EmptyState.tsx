import React from "react";
import { LucideIcon, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-surface-border rounded-xl bg-surface/50 max-w-lg mx-auto my-8">
      <div className="p-4 rounded-full bg-surface-subtle border border-surface-border mb-4 text-muted-foreground">
        <Icon className="w-8 h-8 text-accent/80" />
      </div>
      <h3 className="text-lg font-semibold text-foreground font-heading">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      {(actionLabel && actionHref) && (
        <div className="mt-6">
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        </div>
      )}
      {(actionLabel && onAction && !actionHref) && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
