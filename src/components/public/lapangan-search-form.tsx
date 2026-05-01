"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Search, X } from "lucide-react";

type Props = { defaultQuery: string };

export function LapanganSearchForm({ defaultQuery }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(defaultQuery);

  useEffect(() => {
    setQ(defaultQuery);
  }, [defaultQuery]);

  function applyQuery(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = next.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    const qs = params.toString();
    router.push(qs ? `/lapangan?${qs}` : "/lapangan");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    applyQuery(q);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full rounded-xl bg-white p-2 sm:p-2.5 shadow-inner"
    >
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-500/70 pointer-events-none" />
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nama court, venue, alamat…"
          className="w-full pl-11 pr-10 py-3 rounded-lg border-0 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-500/25 outline-none transition text-sm"
          autoComplete="off"
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              applyQuery("");
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/80"
            aria-label="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
      <div className="flex gap-2 shrink-0 sm:items-stretch">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 rounded-lg gradient-brand text-white text-sm font-bold shadow-lg shadow-brand-600/30 hover:brightness-105 active:scale-[0.98] transition-all"
        >
          Cari
        </button>
      </div>
    </form>
  );
}
