"use client";

import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/InlineSkeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { useApiQuery } from "@/lib/useApiQuery";

export default function AdminEmployeesPage() {
  const { data, loading, setData } = useApiQuery(
    () => Promise.all([api.adminEmployees(), api.adminDepartments()]).then(([employees, departments]) => ({ employees, departments })),
    () => {
      const employees = api.getCached<any[]>("/api/admin/employees");
      const departments = api.getCached<any[]>("/api/admin/departments");
      return employees && departments ? { employees, departments } : null;
    },
  );
  const employees = data?.employees ?? [];
  const departments = data?.departments ?? [];
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", job_title: "", department_id: 0 });
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [emps, depts] = await Promise.all([api.adminEmployees(), api.adminDepartments()]);
    setData({ employees: emps, departments: depts });
  }

  async function createEmployee(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      await api.createEmployee({ ...form, role: "employee" });
      await load();
      setForm({ name: "", email: "", password: "", job_title: "", department_id: 0 });
      setMessage("Employee created.");
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    await api.updateEmployee(editing.id, {
      name: editing.name,
      job_title: editing.job_title,
      status: editing.status,
      department_id: editing.department_id,
    });
    setEditing(null);
    await load();
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Admin" title="Employee Management" description="Add, edit, and manage workforce members." />
      {message ? <p className="text-sm text-brand">{message}</p> : null}
      <form onSubmit={createEmployee} className="card grid gap-4 p-6 md:grid-cols-2">
        <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" placeholder="Job title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
        <select className="input" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: Number(e.target.value) })}>
          <option value={0}>No department</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input className="input" placeholder="Password (min 8 characters)" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" className="btn-primary md:col-span-2">Add Employee</button>
      </form>
      {!data && loading ? <TableSkeleton rows={8} /> : <DataTable minWidth="40rem">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="table-row">
                <td className="px-4 py-3 font-mono-custom text-xs">{emp.employee_code}</td>
                <td className="px-4 py-3">{emp.name}</td>
                <td className="px-4 py-3">{emp.email}</td>
                <td className="px-4 py-3">{emp.department_name || "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                <td className="px-4 py-3"><button type="button" className="tap-target text-xs text-brand" onClick={() => setEditing({ ...emp })}>Edit</button></td>
              </tr>
            ))}
          </tbody>
      </DataTable>}
      {editing ? (
        <div className="card space-y-4 p-6">
          <h2 className="font-display text-lg">Edit {editing.name}</h2>
          <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          <input className="input" value={editing.job_title || ""} onChange={(e) => setEditing({ ...editing, job_title: e.target.value })} />
          <select className="input" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="input" value={editing.department_id || 0} onChange={(e) => setEditing({ ...editing, department_id: Number(e.target.value) })}>
            <option value={0}>No department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="button" className="btn-primary" onClick={saveEdit}>Save</button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
