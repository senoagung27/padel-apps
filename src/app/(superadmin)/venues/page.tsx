"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatRupiah } from "@/lib/utils";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";

interface VenueData {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  isActive: boolean;
  bankName: string | null;
  bankAccount: string | null;
}

export default function SuperadminVenuesPage() {
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", address: "", description: "", bankName: "", bankAccount: "", bankHolder: "", phone: "" });
  const [saving, setSaving] = useState(false);

  async function loadVenues() {
    try {
      const res = await fetch("/api/admin/venues");
      if (res.ok) setVenues(await res.json());
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadVenues(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/venues/${editingId}` : "/api/admin/venues";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setShowForm(false); setEditingId(null); setForm({ name: "", slug: "", address: "", description: "", bankName: "", bankAccount: "", bankHolder: "", phone: "" }); loadVenues(); }
    } catch {}
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus venue ini?")) return;
    try {
      await fetch(`/api/admin/venues/${id}`, { method: "DELETE" });
      loadVenues();
    } catch {}
  }

  function handleEdit(v: VenueData) {
    setForm({ name: v.name, slug: v.slug, address: v.address || "", description: "", bankName: v.bankName || "", bankAccount: v.bankAccount || "", bankHolder: "", phone: "" });
    setEditingId(v.id);
    setShowForm(true);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Venue</h1>
          <p className="text-sm text-gray-500 mt-1">{venues.length} venue terdaftar</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", slug: "", address: "", description: "", bankName: "", bankAccount: "", bankHolder: "", phone: "" }); }} className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold flex items-center gap-2 shadow-md">
          <Plus className="w-4 h-4" />{showForm ? "Tutup" : "Tambah Venue"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border p-6 mb-6 space-y-4 animate-fade-in">
          <h3 className="font-bold text-gray-900">{editingId ? "Edit" : "Tambah"} Venue</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Nama Venue" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none" required />
            <input placeholder="Slug (auto)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none font-mono" required />
            <input placeholder="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none sm:col-span-2" />
            <input placeholder="No. Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            <input placeholder="Nama Bank" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            <input placeholder="No. Rekening" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            <input placeholder="Atas Nama Rekening" value={form.bankHolder} onChange={(e) => setForm({ ...form, bankHolder: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none" />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl gradient-brand text-white font-semibold flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{editingId ? "Update" : "Simpan"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Nama</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Alamat</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Bank</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {venues.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{v.name}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{v.address || "-"}</td>
                <td className="px-5 py-3 text-xs">{v.bankName || "-"} {v.bankAccount || ""}</td>
                <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${v.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{v.isActive ? "Aktif" : "Nonaktif"}</span></td>
                <td className="px-5 py-3 flex gap-2">
                  <button onClick={() => handleEdit(v)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {venues.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Belum ada venue</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
