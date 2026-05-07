"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import type { StoreConfig } from "@/lib/store-config";
import ProductCard from "./ProductCard";
import clsx from "clsx";

interface ReservationFormProps {
  products: Product[];
  config: StoreConfig;
}

interface FormState {
  productId: string;
  quantity: string;
  deliveryDay: string;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
}

const INITIAL_STATE: FormState = {
  productId: "",
  quantity: "1",
  deliveryDay: "",
  customerName: "",
  email: "",
  phone: "",
  notes: "",
};

export default function ReservationForm({ products, config }: ReservationFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === form.productId);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.productId) return setError("Selecciona un producto.");
    if (!form.deliveryDay) return setError("Elige un día de entrega.");

    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          quantity: Number(form.quantity),
          deliveryDay: form.deliveryDay,
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear la reserva. Inténtalo de nuevo.");
        return;
      }

      // Redirigir a Stripe Checkout
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Error de conexión. Comprueba tu internet e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const depositPreview =
    selectedProduct ? selectedProduct.depositAmount * Number(form.quantity) : null;
  const pendingPreview =
    selectedProduct
      ? selectedProduct.finalPrice * Number(form.quantity) - (depositPreview ?? 0)
      : null;

  return (
    <section className="py-12 px-4" id="reservar">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reserva tu pedido</h2>
        <p className="text-gray-600 mb-8">
          Elige tu producto, rellena tus datos y paga 1 € para confirmar.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Selección de producto */}
          <fieldset className="mb-8">
            <legend className="text-sm font-medium text-gray-700 mb-3">
              Elige tu producto
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selected={form.productId === product.id}
                  onSelect={(id) => setForm((prev) => ({ ...prev, productId: id }))}
                />
              ))}
            </div>
          </fieldset>

          {/* Cantidad y día */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                max={config.maxQuantityPerOrder}
                required
                value={form.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label htmlFor="deliveryDay" className="block text-sm font-medium text-gray-700 mb-1">
                Día de entrega
              </label>
              <select
                id="deliveryDay"
                name="deliveryDay"
                required
                value={form.deliveryDay}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Seleccionar...</option>
                {config.deliveryDays.map((day) => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                placeholder="Tu nombre"
                value={form.customerName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+34 600 000 000"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Notas opcionales */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Alergias, instrucciones especiales..."
              value={form.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>

          {/* Resumen de precios */}
          {selectedProduct && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Precio total ({form.quantity} × {selectedProduct.finalPrice} €)</span>
                <span>{selectedProduct.finalPrice * Number(form.quantity)} €</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Abono ahora</span>
                <span className="font-semibold text-gray-900">— {depositPreview} €</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-medium text-gray-900">
                <span>Pendiente al recoger</span>
                <span>{pendingPreview} €</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-md px-3 py-2">
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
            {loading ? "Redirigiendo a pago..." : "Reservar y pagar 1 €"}
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Pago seguro con Stripe. No guardamos datos de tu tarjeta.
          </p>
        </form>
      </div>
    </section>
  );
}
