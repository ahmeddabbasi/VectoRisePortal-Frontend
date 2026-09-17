"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/InlineSkeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { useApiQuery } from "@/lib/useApiQuery";

export default function AdminTasksPage() {
  const { data, loading, setData } = useApiQuery(
    () => Promise.all([api.hrmTasks(), api.adminEmployees()]).then(([tasks, employees]) => ({ tasks, employees })),
    () => {
      const tasks = api.getCached<any[]>("/api/hrm/tasks");
      const employees = api.getCached<any[]>("/api/admin/employees");
      return tasks && employees ? { tasks, employees } : null;
    },
  );
  const tasks = data?.tasks ?? [];
  const employees = data?.employees ?? [];
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_employee_id: 0,
    priority: "medium",
    task_type: "outreach",
    due_date: "",
    estimated_minutes: 60,
  });

  async function load() {
    const [taskRows, emps] = await Promise.all([api.hrmTasks(), api.adminEmployees()]);
    setData({ tasks: taskRows, employees: emps });
    if (emps[0] && !form.assigned_employee_id) setForm((f) => ({ ...f, assigned_employee_id: emps[0].id }));
  }

  async function assignTask(e: React.FormEvent) {
    e.preventDefault();
    await api.createTask({ ...form, due_date: form.due_date || null, auto_checklist: true });
    await load();
  }

  async function approveTask(id: number) {
    await api.approveTask(id);
    await load();
  }

  async function rejectTask(id: number) {
    const reason = window.prompt("Rejection reason (optional):") || undefined;
    await api.rejectTask(id, reason);
    await load();
  }

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.name]));
  const pending = tasks.filter((t) => t.status === "pending_approval");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Admin" title="Task Management" description="Approve employee tasks, assign work, and track progress." />

      {pending.length ? (
        <div className="card overflow-hidden">
          <div className="border-b border-ink/10 px-4 py-3">
            <h2 className="font-display text-lg">Pending approval ({pending.length})</h2>
          </div>
          <table className="w-full text-left">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.title}</p>
                    {t.description ? <p className="text-xs text-muted-foreground">{t.description}</p> : null}
                  </td>
                  <td className="px-4 py-3">{empMap[t.assigned_employee_id] || `#${t.assigned_employee_id}`}</td>
                  <td className="px-4 py-3">{t.due_date || "—"}</td>
                  <td className="px-4 py-3">{t.priority}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="btn-primary text-xs" onClick={() => approveTask(t.id)}>Approve</button>
                      <button type="button" className="btn-secondary text-xs" onClick={() => rejectTask(t.id)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <form onSubmit={assignTask} className="card grid gap-4 p-6 md:grid-cols-2">
        <h2 className="font-display text-lg md:col-span-2">Assign task to employee</h2>
        <input className="input md:col-span-2" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="input md:col-span-2 min-h-20" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select className="input" value={form.assigned_employee_id} onChange={(e) => setForm({ ...form, assigned_employee_id: Number(e.target.value) })}>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          {["low", "medium", "high", "urgent"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="input" value={form.task_type} onChange={(e) => setForm({ ...form, task_type: e.target.value })}>
          <option value="outreach">Outreach</option>
          <option value="research">Research</option>
          <option value="general">General</option>
        </select>
        <input className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        <input className="input" type="number" placeholder="Est. minutes" value={form.estimated_minutes} onChange={(e) => setForm({ ...form, estimated_minutes: Number(e.target.value) })} />
        <button type="submit" className="btn-primary md:col-span-2">Assign Task</button>
      </form>

      {!data && loading ? <TableSkeleton rows={8} /> : null}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="table-row">
                <td className="px-4 py-3">{t.title}</td>
                <td className="px-4 py-3">{empMap[t.assigned_employee_id] || `#${t.assigned_employee_id}`}</td>
                <td className="px-4 py-3">{t.priority}</td>
                <td className="px-4 py-3">{t.due_date || "—"}</td>
                <td className="px-4 py-3">{t.progress}%</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
