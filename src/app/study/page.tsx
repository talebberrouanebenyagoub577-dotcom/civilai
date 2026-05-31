"use client";

import { useRef, useState } from "react";
import { BrainCircuit } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIStudyForm } from "@/components/forms/AIStudyForm";
import { AIStudyReportView } from "@/components/reports/AIStudyReportView";
import { Disclaimer } from "@/components/ui/Disclaimer";
import type { AIStudyInput, AIStudyReport } from "@/types";

export default function AIStudyPage() {
  const [input, setInput] = useState<AIStudyInput | null>(null);
  const [report, setReport] = useState<AIStudyReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  function handleGenerate(studyInput: AIStudyInput, studyReport: AIStudyReport) {
    setInput(studyInput);
    setReport(studyReport);
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-100 p-3">
            <BrainCircuit className="h-8 w-8 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Engineering Study</h1>
            <p className="mt-1 max-w-2xl text-slate-500">
              Enter building parameters to instantly generate a preliminary structural study with
              column grid layout, slab sizing, foundation recommendations, and a visual grid diagram.
            </p>
          </div>
        </div>

        <AIStudyForm onGenerate={handleGenerate} />

        {!report && <Disclaimer />}

        {report && input && (
          <div ref={reportRef}>
            <AIStudyReportView input={input} report={report} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
