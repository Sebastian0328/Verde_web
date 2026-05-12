"use client";

import { useState } from "react";
import clsx from "clsx";

const inputClass =
  "w-full border-0 border-b border-crema/20 bg-transparent px-0 py-2.5 text-sm text-crema placeholder:text-crema/25 focus:outline-none focus:border-crema/55 transition-colors duration-200";

const labelClass =
  "block text-[10px] font-medium uppercase tracking-[0.2em] text-crema/38 mb-2";

export default function WaitlistForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrarte. Inténtalo de nuevo.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="py-6">
        <p className="text-oro text-[10px] font-medium tracking-[0.35em] uppercase mb-2">
          ¡Anotado!
        </p>
        <p className="text-crema/55 text-sm leading-relaxed">
          Te avisaremos por WhatsApp cuando abran los próximos cupos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <div>
        <label htmlFor="wl-name" className={labelClass}>
          Nombre
        </label>
        <input
          id="wl-name"
          name="name"
          type="text"
          required
          placeholder="Tu nombre"
          value={form.name}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="wl-phone" className={labelClass}>
          WhatsApp
        </label>
        <input
          id="wl-phone"
          name="phone"
          type="tel"
          required
          placeholder="+34 600 000 000"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="wl-email" className={labelClass}>
          Email (opcional)
        </label>
        <input
          id="wl-email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {error && (
        <div className="border-l-2 border-tierra/40 pl-4 py-1">
          <p className="text-crema/55 text-sm">{error}</p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "w-full border border-oro/45 text-oro text-[11px] font-semibold tracking-[0.22em] uppercase py-4 px-6 transition-all duration-300 flex items-center justify-center gap-3",
            loading
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-oro hover:text-negro hover:border-oro"
          )}
        >
          {loading && (
            <span className="w-4 h-4 border border-oro/30 border-t-oro rounded-full animate-spin shrink-0" />
          )}
          {loading ? "Guardando..." : "Avisarme primero"}
        </button>
      </div>
    </form>
  );
}
