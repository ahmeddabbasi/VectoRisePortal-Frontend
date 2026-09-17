"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [sync, setSync] = useState<any>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const [sourceRows, status, count] = await Promise.all([
      api.sources(),
      api.syncStatus(),
      api.leadsCount().catch(() => ({ count: 0 })),
    ]);
    setSources(sourceRows);
    setSync(status);
    setLeadCount(count.count);
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  async function syncNow() {
    setSyncing(true);
    setError(null);
    try {
      await api.syncNow();
      const finalStatus = await api.waitForSync();
      setSync(finalStatus);
      api.clearCache();
      await refresh();
      if (finalStatus.status === "failed") {
        setError(finalStatus.message || "Sync failed");
      }
    } catch (err: any) {
      setError(err.message || "Sync failed");
      await refresh();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="07 / Sources"
        title="Operational"
        accent="settings."
        description="Data sources, sync status, and operational notes."
        action={
          <button onClick={syncNow} disabled={syncing} className="btn-primary sheen">
            {syncing ? "Syncing in background..." : "Sync now"}
            <ArrowUpRight size={14} />
          </button>
        }
      />

      <div className="card p-5">
        <p className="chart-subtitle mb-1">Sync</p>
        <h3 className="chart-title mb-2">Status</h3>
        <p>Status: {sync?.status || "unknown"}</p>
        <p className="text-sm text-muted-foreground">
          Last sync: {sync?.last_sync_at ? new Date(sync.last_sync_at).toLocaleString() : "Never"}
        </p>
        <p className="text-sm text-muted-foreground">{sync?.message}</p>
        {typeof sync?.leads_upserted === "number" ? (
          <p className="text-sm text-muted-foreground">Leads imported this run: {sync.leads_upserted}</p>
        ) : null}
        {leadCount !== null ? (
          <p className="mt-2 text-sm font-medium text-ink">Leads currently in database: {leadCount}</p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        {syncing ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Sync runs in the background so you can keep navigating. This page will update when it finishes.
          </p>
        ) : null}
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="table-head">
            <tr>
              {["Source", "Employee", "Category", "GID", "Type", "Last Sync", "Status"].map((h) => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.employee_name}</td>
                <td className="px-4 py-3">{s.category}</td>
                <td className="px-4 py-3">{s.sheet_gid}</td>
                <td className="px-4 py-3">{s.data_type}</td>
                <td className="px-4 py-3">{s.last_sync_at ? new Date(s.last_sync_at).toLocaleString() : "—"}</td>
                <td className="px-4 py-3">{s.last_sync_status || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
