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

interface FormFields {
  deliveryDay: string;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
}

const INITIAL_FIELDS: FormFields = {
  deliveryDay: "",
  customerName: "",
  email: "",
  phone: "",
  notes: "",
};

const inputClass =
  "w-full border-0 border-b border-negro/15 bg-transparent px-0 py-2.5 text-sm text-negro placeholder:text-negro/28 focus:outline-none focus:border-verde-bosque transition-colors duration-200";

const labelClass =
  "block text-[10px] font-medium uppercase tracking-[0.2em] text-negro/40 mb-2";

export default function ReservationForm({ products, config }: ReservationFormProps) {
  // cart: productId → quantity
  const [cart, setCart] = useState<Record<string, number>>({});
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cart helpers
  function addToCart(productId: string) {
    setCart((prev) => ({ ...prev, [productId]: 1 }));
    setError(null);
  }

  function increment(productId: string) {
    setCart((prev) => {
      const current = prev[productId] ?? 0;
      if (current >= config.maxQuantityPerOrder) return prev;
      return { ...prev, [productId]: current + 1 };
    });
  }

  function decrement(productId: string) {
    setCart((prev) => {
      const current = prev[productId] ?? 0;
      if (current <= 1) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: current - 1 };
    });
  }

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  // Computed cart values
  const cartProducts = products.filter((p) => (cart[p.id] ?? 0) > 0);
  const totalItems = cartProducts.reduce((s, p) => s + (cart[p.id] ?? 0), 0);
  const totalDeposit = cartProducts.reduce((s, p) => s + p.depositAmount * (cart[p.id] ?? 0), 0);
  const totalFinal = cartProducts.reduce((s, p) => s + p.finalPrice * (cart[p.id] ?? 0), 0);
  const totalPending = totalFinal - totalDeposit;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (cartProducts.length === 0) {
      setError("Añade al menos un producto a tu pedido.");
      return;
    }
    if (!fields.deliveryDay) {
      setError("Elige un día de entrega.");
      return;
    }

    const itemsPayload = cartProducts.map((p) => ({
      productId: p.id,
      quantity: cart[p.id],
    }));

    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsPayload,
          deliveryDay: fields.deliveryDay,
          customerName: fields.customerName,
          email: fields.email,
          phone: fields.phone,
          notes: fields.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear la reserva. Inténtalo de nuevo.");
        return;
      }

      if (data.url) window.location.href = data.url;
    } catch {
      setError("Error de conexión. Comprueba tu internet e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 px-6" id="reservar">
      <div className="max-w-2xl mx-auto">
        <div className="mb-14">
          <p className="text-negro/30 text-[10px] font-medium tracking-[0.4em] uppercase mb-3">
            Tu pedido
          </p>
          <h2 className="text-verde-bosque text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Reserva tus bolones
          </h2>
          <p className="text-negro/50 text-sm leading-relaxed">
            Añade uno o varios productos y paga{" "}
            <span className="font-semibold text-tierra">1 € por unidad</span>{" "}
            para confirmar. El resto lo abonás cuando recoges.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* 01 — Productos */}
          <fieldset className="mb-10">
            <legend className={clsx(labelClass, "mb-5")}>01 — Productos</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={cart[product.id] ?? 0}
                  maxQuantity={config.maxQuantityPerOrder}
                  onAdd={addToCart}
                  onIncrement={increment}
                  onDecrement={decrement}
                />
              ))}
            </div>

            {/* Mini resumen del carrito */}
            {cartProducts.length > 0 && (
              <div className="mt-5 flex items-center justify-between border-t border-verde-bosque/15 pt-4">
                <p className="text-sm text-verde-bosque/70">
                  <span className="font-semibold text-verde-bosque">{totalItems}</span>{" "}
                  {totalItems === 1 ? "unidad" : "unidades"} ·{" "}
                  {cartProducts.length} {cartProducts.length === 1 ? "producto" : "productos"}
                </p>
                <p className="text-sm font-semibold text-verde-bosque">
                  Abono: {totalDeposit} €
                </p>
              </div>
            )}
          </fieldset>

          {/* 02 — Entrega */}
          <fieldset className="mb-10 pb-10 border-b border-negro/8">
            <legend className={clsx(labelClass, "mb-5")}>02 — Día de entrega</legend>
            <div className="max-w-xs">
              <label htmlFor="deliveryDay" className={labelClass}>
                Selecciona el día
              </label>
              <select
                id="deliveryDay"
                name="deliveryDay"
                required
                value={fields.deliveryDay}
                onChange={handleFieldChange}
                className={inputClass}
              >
                <option value="">Seleccionar...</option>
                {config.deliveryDays.map((day) => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          {/* 03 — Tus datos */}
          <fieldset className="mb-10 pb-10 border-b border-negro/8">
            <legend className={clsx(labelClass, "mb-5")}>03 — Tus datos</legend>
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="customerName" className={labelClass}>
                  Nombre completo
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={fields.customerName}
                  onChange={handleFieldChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={fields.email}
                  onChange={handleFieldChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+34 600 000 000"
                  value={fields.phone}
                  onChange={handleFieldChange}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          {/* Notas */}
          <div className="mb-10">
            <label htmlFor="notes" className={labelClass}>
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Alergias, instrucciones especiales..."
              value={fields.notes}
              onChange={handleFieldChange}
              className={clsx(inputClass, "resize-none")}
            />
          </div>

          {/* Resumen del pedido */}
          {cartProducts.length > 0 && (
            <div className="border-t border-b border-negro/10 py-6 mb-8">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-negro/30 mb-5">
                Resumen del pedido
              </p>
              <div className="space-y-2 mb-4">
                {cartProducts.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm text-negro/60">
                    <span>
                      {p.name}{" "}
                      <span className="text-negro/38">×{cart[p.id]}</span>
                    </span>
                    <span>{p.finalPrice * (cart[p.id] ?? 0)} €</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-negro/10 pt-4 text-sm">
                <div className="flex justify-between text-negro/55">
                  <span>Total del pedido</span>
                  <span>{totalFinal} €</span>
                </div>
                <div className="flex justify-between text-negro/55">
                  <span>Abono ahora ({totalItems} × 1 €)</span>
                  <span className="font-semibold text-tierra">— {totalDeposit} €</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-negro/10 font-semibold text-verde-bosque">
                  <span>Pendiente al recoger</span>
                  <span>{totalPending} €</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="border-l-2 border-tierra/35 pl-4 py-1 mb-6">
              <p className="text-tierra text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full bg-verde-bosque text-crema text-[11px] font-semibold tracking-[0.2em] uppercase py-5 px-6 transition-all duration-300 flex items-center justify-center gap-3",
              loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-verde-platano"
            )}
          >
            {loading && (
              <span className="w-4 h-4 border border-crema/30 border-t-crema rounded-full animate-spin shrink-0" />
            )}
            {loading
              ? "Procesando..."
              : `Reservar y pagar ${totalDeposit > 0 ? totalDeposit : 1} €`}
          </button>

          <p className="text-[10px] font-medium text-negro/25 uppercase tracking-wider mt-4 text-center">
            Pago seguro con Stripe · No guardamos datos de tu tarjeta
          </p>
        </form>
      </div>
    </section>
  );
}
