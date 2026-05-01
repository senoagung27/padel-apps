"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";

interface Operator { id: string; name: string; email: string; role: string; }

export default function SuperadminOperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  async function loadOperators() {
    try { const res = await fetch("/api/admin/operators"); if (res.ok) setOperators(await res.json()); } catch {}
    setLoading(false);
  }

  useEffect(() => { loadOperators(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/operators", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setShowForm(false); setForm({ name: "", email: "", password: "" }); loadOperators(); }
    } catch {}
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Operator</h1>
          <p className="text-sm text-gray-500 mt-1">{operators.length} operator terdaftar</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold flex items-center gap-2 shadow-md">
          <Plus className="w-4 h-4" />{showForm ? "Tutup" : "Tambah Operator"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border p-6 mb-6 space-y-4 animate-fade-in">
          <h3 className="font-bold text-gray-900">Tambah Operator Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none" required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none" required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none" required />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl gradient-brand text-white font-semibold flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}Simpan
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Nama</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {operators.map((op) => (
              <tr key={op.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{op.name}</td>
                <td className="px-5 py-3 text-gray-500">{op.email}</td>
                <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">{op.role}</span></td>
              </tr>
            ))}
            {operators.length === 0 && <tr><td colSpan={3} className="px-5 py-12 text-center text-gray-400">Belum ada operator</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
