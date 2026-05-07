"use client";

import { useState } from "react";
import clsx from "clsx";

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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="font-semibold text-gray-900 mb-1">¡Anotado!</p>
        <p className="text-sm text-gray-600">
          Te avisaremos por WhatsApp cuando abran los próximos cupos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="wl-name" className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label htmlFor="wl-phone" className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label htmlFor="wl-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email (opcional)
        </label>
        <input
          id="wl-email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label htmlFor="wl-message" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje (opcional)
        </label>
        <textarea
          id="wl-message"
          name="message"
          rows={2}
          placeholder="¿Algo que quieras decirnos?"
          value={form.message}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={clsx(
          "w-full bg-gray-900 text-white font-medium py-3 px-6 rounded-md text-sm transition-colors",
          loading ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-700"
        )}
      >
        {loading ? "Guardando..." : "Avisarme primero"}
      </button>
    </form>
  );
}
