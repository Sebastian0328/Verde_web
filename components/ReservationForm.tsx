"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/products";
import type { StoreConfig } from "@/lib/store-config";
import ProductCard from "./ProductCard";
import clsx from "clsx";

interface TimeSlot {
  time: string;
  status: "available" | "sold_out";
  remaining: number;
}

interface DayAvailability {
  date: string;
  status: "available" | "sold_out" | "closed" | "past_or_today";
  note: string;
  slots: TimeSlot[];
}

interface ReservationFormProps {
  products: Product[];
  config: StoreConfig;
}

interface FormFields {
  reservationDate: string;
  reservationTime: string;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  deliveryMethod: "delivery" | "pickup";
  deliveryAddress: string;
  deliveryDetails: string;
  postalCode: string;
  deliveryZone: string;
}

const INITIAL_FIELDS: FormFields = {
  reservationDate: "",
  reservationTime: "",
  customerName: "",
  email: "",
  phone: "",
  notes: "",
  deliveryMethod: "delivery",
  deliveryAddress: "",
  deliveryDetails: "",
  postalCode: "",
  deliveryZone: "",
};

const inputClass =
  "w-full border-0 border-b border-negro/15 bg-transparent px-0 py-2.5 text-sm text-negro placeholder:text-negro/28 focus:outline-none focus:border-verde-bosque transition-colors duration-200";

const labelClass =
  "block text-[10px] font-medium uppercase tracking-[0.2em] text-negro/40 mb-2";

// Returns 0=Mon ... 6=Sun
function dayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  return (d.getDay() + 6) % 7;
}

function formatMonthTitle(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString(
    "es-ES",
    { month: "long", year: "numeric" }
  );
}

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export default function ReservationForm({ products, config }: ReservationFormProps) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data) => setAvailability(Array.isArray(data) ? data : []))
      .catch(() => setAvailability([]))
      .finally(() => setLoadingAvailability(false));
  }, []);

  function addToCart(productId: string) {
    setCart((prev) => ({ ...prev, [productId]: 1 }));
    setError(null);
  }

  function increment(productId: string) {
    setCart((prev) => {
      const cur = prev[productId] ?? 0;
      if (cur >= config.maxQuantityPerOrder) return prev;
      return { ...prev, [productId]: cur + 1 };
    });
  }

  function decrement(productId: string) {
    setCart((prev) => {
      const cur = prev[productId] ?? 0;
      if (cur <= 1) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: cur - 1 };
    });
  }

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  function selectDate(date: string) {
    setFields((prev) => ({ ...prev, reservationDate: date, reservationTime: "" }));
    setError(null);
  }

  function selectTime(time: string) {
    setFields((prev) => ({ ...prev, reservationTime: time }));
    setError(null);
  }

  const selectedDay = availability.find((d) => d.date === fields.reservationDate);

  const cartProducts = products.filter((p) => (cart[p.id] ?? 0) > 0);
  const totalItems = cartProducts.reduce((s, p) => s + (cart[p.id] ?? 0), 0);
  const totalDeposit = cartProducts.reduce(
    (s, p) => s + p.depositAmount * (cart[p.id] ?? 0),
    0
  );
  const totalFinal = cartProducts.reduce(
    (s, p) => s + p.finalPrice * (cart[p.id] ?? 0),
    0
  );
  const totalPending = totalFinal - totalDeposit;

  // Build month groups for calendar (skip past/today)
  const monthMap: Record<string, DayAvailability[]> = {};
  for (const day of availability) {
    if (day.status === "past_or_today") continue;
    const mk = day.date.slice(0, 7);
    if (!monthMap[mk]) monthMap[mk] = [];
    monthMap[mk].push(day);
  }
  const monthKeys = Object.keys(monthMap).sort();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (cartProducts.length === 0) {
      setError("Añade al menos un producto a tu pedido.");
      return;
    }
    if (!fields.reservationDate || !fields.reservationTime) {
      setError("Selecciona una fecha y una hora para continuar.");
      return;
    }
    if (fields.deliveryMethod === "delivery") {
      if (!fields.deliveryAddress || fields.deliveryAddress.trim().length < 5) {
        setError("Introduce una dirección de entrega válida.");
        return;
      }
      if (!fields.postalCode.trim()) {
        setError("El código postal es obligatorio.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartProducts.map((p) => ({ productId: p.id, quantity: cart[p.id] })),
          reservationDate: fields.reservationDate,
          reservationTime: fields.reservationTime,
          customerName: fields.customerName,
          email: fields.email,
          phone: fields.phone,
          notes: fields.notes,
          deliveryMethod: fields.deliveryMethod,
          deliveryAddress: fields.deliveryAddress,
          deliveryDetails: fields.deliveryDetails,
          postalCode: fields.postalCode,
          deliveryZone: fields.deliveryZone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError("Ese horario acaba de agotarse. Elige otro horario disponible.");
          fetch("/api/availability")
            .then((r) => r.json())
            .then((d) => setAvailability(Array.isArray(d) ? d : []));
        } else {
          setError(data.error ?? "Error al crear la reserva. Inténtalo de nuevo.");
        }
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

            {cartProducts.length > 0 && (
              <div className="mt-5 flex items-center justify-between border-t border-verde-bosque/15 pt-4">
                <p className="text-sm text-verde-bosque/70">
                  <span className="font-semibold text-verde-bosque">{totalItems}</span>{" "}
                  {totalItems === 1 ? "unidad" : "unidades"} ·{" "}
                  {cartProducts.length}{" "}
                  {cartProducts.length === 1 ? "producto" : "productos"}
                </p>
                <p className="text-sm font-semibold text-verde-bosque">
                  Abono: {totalDeposit} €
                </p>
              </div>
            )}
          </fieldset>

          {/* 02 — Fecha */}
          <fieldset className="mb-10 pb-10 border-b border-negro/8">
            <legend className={clsx(labelClass, "mb-6")}>
              02 — Elige el día de tu reserva
            </legend>

            {loadingAvailability ? (
              <div className="flex items-center gap-2 text-negro/30 text-sm py-4">
                <span className="w-4 h-4 border border-negro/20 border-t-negro/50 rounded-full animate-spin" />
                Cargando disponibilidad...
              </div>
            ) : monthKeys.length === 0 ? (
              <p className="text-negro/40 text-sm py-4">
                No hay fechas disponibles en este momento.
              </p>
            ) : (
              monthKeys.map((mk) => {
                const daysInGroup = monthMap[mk];
                const dateMap: Record<string, DayAvailability> = {};
                for (const d of daysInGroup) dateMap[d.date] = d;

                const [y, m] = mk.split("-").map(Number);
                const daysInMonth = new Date(y, m, 0).getDate();
                const firstDow = dayOfWeek(`${mk}-01`);

                return (
                  <div key={mk} className="mb-8">
                    <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-negro/40 mb-4 capitalize">
                      {formatMonthTitle(mk)}
                    </p>

                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {DAY_LABELS.map((d) => (
                        <div
                          key={d}
                          className="text-center text-[9px] font-medium text-negro/25 uppercase tracking-wider py-1"
                        >
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDow }).map((_, i) => (
                        <div key={`pad-${i}`} />
                      ))}

                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${mk}-${String(dayNum).padStart(2, "0")}`;
                        const dayData = dateMap[dateStr];
                        const isSelected = fields.reservationDate === dateStr;

                        if (!dayData) {
                          return (
                            <div
                              key={dateStr}
                              className="aspect-square flex items-center justify-center opacity-15"
                            >
                              <span className="text-xs text-negro">{dayNum}</span>
                            </div>
                          );
                        }

                        const isAvail = dayData.status === "available";
                        const isSoldOut = dayData.status === "sold_out";

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            disabled={!isAvail}
                            onClick={() => selectDate(dateStr)}
                            className={clsx(
                              "aspect-square flex flex-col items-center justify-center text-xs transition-all duration-150",
                              isSelected && "bg-verde-bosque text-crema font-semibold",
                              isAvail && !isSelected &&
                                "border border-verde-bosque/25 text-verde-bosque hover:bg-verde-bosque/10",
                              isSoldOut && "opacity-35 cursor-not-allowed text-negro/50",
                              dayData.status === "closed" && "opacity-20 cursor-not-allowed text-negro/30"
                            )}
                          >
                            <span>{dayNum}</span>
                            {isSoldOut && (
                              <span className="hidden sm:block text-[7px] leading-tight uppercase tracking-wide mt-0.5">
                                Sold out
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </fieldset>

          {/* 03 — Hora (solo si hay fecha seleccionada) */}
          {fields.reservationDate && selectedDay && selectedDay.slots.length > 0 && (
            <fieldset className="mb-10 pb-10 border-b border-negro/8">
              <legend className={clsx(labelClass, "mb-5")}>
                03 — Elige una hora disponible
              </legend>
              <div className="flex flex-wrap gap-2">
                {selectedDay.slots.map((slot) => {
                  const isSelected = fields.reservationTime === slot.time;
                  const isSoldOut = slot.status === "sold_out";
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => selectTime(slot.time)}
                      className={clsx(
                        "px-4 py-2 text-sm font-medium border transition-all duration-150",
                        isSelected && "bg-verde-bosque text-crema border-verde-bosque",
                        !isSelected && !isSoldOut &&
                          "border-verde-bosque/30 text-verde-bosque hover:bg-verde-bosque/10",
                        isSoldOut && "border-negro/10 text-negro/25 cursor-not-allowed opacity-40"
                      )}
                    >
                      {slot.time}
                      {isSoldOut && (
                        <span className="ml-1.5 text-[9px] uppercase tracking-wide">
                          · Sold out
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {/* Tus datos */}
          <fieldset className="mb-10 pb-10 border-b border-negro/8">
            <legend className={clsx(labelClass, "mb-5")}>
              {fields.reservationDate ? "04" : "03"} — Tus datos
            </legend>
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

          {/* Entrega */}
          <fieldset className="mb-10 pb-10 border-b border-negro/8">
            <legend className={clsx(labelClass, "mb-5")}>
              {fields.reservationDate ? "05" : "04"} — Entrega
            </legend>

            {/* Método */}
            <div className="mb-6">
              <p className={clsx(labelClass, "mb-3")}>Método de entrega</p>
              <div className="flex border border-negro/15 w-fit">
                <button
                  type="button"
                  onClick={() => setFields((p) => ({ ...p, deliveryMethod: "delivery" }))}
                  className={clsx(
                    "px-5 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-150",
                    fields.deliveryMethod === "delivery"
                      ? "bg-verde-bosque text-crema"
                      : "text-negro/45 hover:text-negro/70"
                  )}
                >
                  Entrega a domicilio
                </button>
                <button
                  type="button"
                  onClick={() => setFields((p) => ({ ...p, deliveryMethod: "pickup" }))}
                  className={clsx(
                    "px-5 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase border-l border-negro/15 transition-colors duration-150",
                    fields.deliveryMethod === "pickup"
                      ? "bg-verde-bosque text-crema"
                      : "text-negro/45 hover:text-negro/70"
                  )}
                >
                  Recogida
                </button>
              </div>
            </div>

            {fields.deliveryMethod === "delivery" && (
              <>
                <p className="text-negro/35 text-xs leading-relaxed mb-6 max-w-sm">
                  Por ahora entregamos solo en zonas habilitadas. Si tu dirección está fuera de cobertura, te contactaremos por WhatsApp.
                </p>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="deliveryAddress" className={labelClass}>
                      Dirección de entrega
                    </label>
                    <input
                      id="deliveryAddress"
                      name="deliveryAddress"
                      type="text"
                      required
                      placeholder="Calle, número, piso, puerta"
                      value={fields.deliveryAddress}
                      onChange={handleFieldChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className={labelClass}>
                      Código postal
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      required
                      placeholder="28000"
                      value={fields.postalCode}
                      onChange={handleFieldChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="deliveryZone" className={labelClass}>
                      Zona (opcional)
                    </label>
                    <input
                      id="deliveryZone"
                      name="deliveryZone"
                      type="text"
                      placeholder="Barrio o distrito"
                      value={fields.deliveryZone}
                      onChange={handleFieldChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="deliveryDetails" className={labelClass}>
                      Detalles de entrega (opcional)
                    </label>
                    <input
                      id="deliveryDetails"
                      name="deliveryDetails"
                      type="text"
                      placeholder="Timbre, referencia, indicaciones para el repartidor"
                      value={fields.deliveryDetails}
                      onChange={handleFieldChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            )}
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
              {fields.reservationDate && fields.reservationTime && (
                <div className="mb-3 space-y-1">
                  <div className="flex justify-between text-sm text-negro/45">
                    <span>Fecha</span>
                    <span>{fields.reservationDate}</span>
                  </div>
                  <div className="flex justify-between text-sm text-negro/45">
                    <span>Hora</span>
                    <span>{fields.reservationTime}</span>
                  </div>
                </div>
              )}
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
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-verde-platano"
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
