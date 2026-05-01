"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Login gagal");
      } else {
        // Redirect based on role
        const res = await fetch("/api/auth/get-session");
        if (res.ok) {
          const session = await res.json();
          if (session?.user?.role === "superadmin") {
            router.push("/superadmin/dashboard");
          } else {
            router.push("/operator/dashboard");
          }
        }
      }
    } catch {
      setError("Login gagal. Periksa email dan password Anda.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/25">
              <span className="text-white font-bold text-xl">P</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Welcome Back</h1>
          <p className="text-navy-300 text-sm mt-1">Login ke dashboard PadelBook</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-300 text-center">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-1.5"><Mail className="w-3.5 h-3.5 inline mr-1" />Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@padelbook.id" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-navy-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-1.5"><Lock className="w-3.5 h-3.5 inline mr-1" />Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-navy-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl gradient-brand text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:shadow-xl disabled:opacity-50 transition-all">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</> : "Login"}
          </button>
        </form>

        <p className="text-center text-navy-400 text-xs mt-6">
          <Link href="/" className="hover:text-white transition-colors">← Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  );
}
