import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <Icon className="h-6 w-6 text-blue-700" />
        </div>
      </div>
    </div>
  );
}
