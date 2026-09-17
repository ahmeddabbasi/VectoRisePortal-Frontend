"use client";

import { useState } from "react";
import { KpiGrid } from "@/components/KpiGrid";
import { PageHeader } from "@/components/PageHeader";
import { KpiSkeleton } from "@/components/InlineSkeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { useApiQuery } from "@/lib/useApiQuery";

export default function EmployeeDashboardPage() {
  const { data, setData } = useApiQuery(
    () => api.employeeDashboard(),
    () => api.getCached("/api/employee/dashboard"),
  );
  const [loading, setLoading] = useState(false);

  async function handleCheckIn() {
    setLoading(true);
    try {
      await api.checkIn();
      const refreshed = await api.employeeDashboard();
      setData(refreshed);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    setLoading(true);
    try {
      await api.checkOut();
      const refreshed = await api.employeeDashboard();
      setData(refreshed);
    } finally {
      setLoading(false);
    }
  }

  const attendance = data?.attendance || {};
  const tasks = data?.tasks || {};

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Employee"
        title={`Welcome, ${data?.employee?.name || "Team Member"}`}
        description={data ? `Today is ${data.date}. Track attendance, tasks, and performance.` : "Loading your dashboard..."}
      />

      {!data ? (
        <>
          <div className="card h-28 animate-pulse rounded-2xl bg-black/[0.03]" />
          <KpiSkeleton count={4} />
        </>
      ) : null}

      {data ? <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="kpi-label">Attendance Status</p>
            <div className="mt-2 flex items-center gap-3">
              <StatusBadge status={attendance.status || "incomplete"} />
              <span className="text-sm text-muted-foreground">
                {data.is_checked_in ? "Currently working" : attendance.check_in_at ? "Checked out" : "Not checked in"}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {!data.is_checked_in && !attendance.check_out_at ? (
              <button className="btn-primary" onClick={handleCheckIn} disabled={loading}>Check In</button>
            ) : null}
            {data.is_checked_in ? (
              <button className="btn-secondary" onClick={handleCheckOut} disabled={loading}>Check Out</button>
            ) : null}
          </div>
        </div>
      </div> : null}

      {data ? <KpiGrid
        items={[
          { label: "Tasks Due Today", value: tasks.due_today ?? 0 },
          { label: "Completed", value: tasks.completed ?? 0 },
          { label: "Pending", value: tasks.pending ?? 0 },
          { label: "Overdue", value: tasks.overdue ?? 0 },
        ]}
      /> : null}

      {data?.notifications?.length ? (
        <section className="card p-6">
          <h2 className="font-display text-lg">Notifications</h2>
          <ul className="mt-4 space-y-3">
            {data.notifications.map((n: any) => (
              <li key={n.id} className="rounded-xl border border-ink/10 p-3">
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
