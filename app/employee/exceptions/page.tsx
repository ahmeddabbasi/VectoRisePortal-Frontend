"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/lib/api";

export default function EmployeeExceptionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [explaining, setExplaining] = useState<number | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    api.employeeExceptions().then(setItems).catch(() => setItems([]));
  }, []);

  async function submitExplanation(id: number) {
    await api.explainException(id, text);
    setExplaining(null);
    setText("");
    setItems(await api.employeeExceptions());
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Employee" title="My Exceptions" description="View attendance and schedule exceptions. Provide explanations when requested." />
      {items.length === 0 ? <EmptyState title="No exceptions" description="You're all clear — no open exceptions on your record." /> : null}
      {items.map((item) => (
        <div key={item.id} className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-lg">{item.title}</p>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          {item.employee_explanation ? <p className="mt-3 text-sm">Your explanation: {item.employee_explanation}</p> : null}
          {item.admin_response ? <p className="mt-2 text-sm text-brand">Admin: {item.admin_response}</p> : null}
          {item.status === "open" && explaining !== item.id ? (
            <button type="button" className="btn-secondary mt-4 text-xs" onClick={() => setExplaining(item.id)}>Provide Explanation</button>
          ) : null}
          {explaining === item.id ? (
            <div className="mt-4 space-y-2">
              <textarea className="input w-full min-h-20" value={text} onChange={(e) => setText(e.target.value)} />
              <button type="button" className="btn-primary text-xs" onClick={() => submitExplanation(item.id)}>Submit</button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
