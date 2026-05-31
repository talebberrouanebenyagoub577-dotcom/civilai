import { AlertTriangle } from "lucide-react";
import { DISCLAIMER } from "@/constants/engineering";

export function Disclaimer() {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <p className="text-sm leading-relaxed text-amber-900">
        <span className="font-semibold">Disclaimer: </span>
        {DISCLAIMER}
      </p>
    </div>
  );
}
