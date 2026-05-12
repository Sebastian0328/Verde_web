import { stripe } from "@/lib/stripe";

interface GraciasPageProps {
  searchParams: { session_id?: string };
}

interface ItemMeta {
  id: string;
  name: string;
  qty: number;
  price: number;
  deposit: number;
}

export default async function GraciasPage({ searchParams }: GraciasPageProps) {
  const sessionId = searchParams.session_id;

  let customerName = "";
  let deliveryDay = "";
  let totalDeposit = "";
  let totalPending = "";
  let items: ItemMeta[] = [];

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata) {
        customerName = session.metadata.customerName ?? "";
        deliveryDay = session.metadata.deliveryDay ?? "";
        totalDeposit = session.metadata.totalDeposit ?? "";
        totalPending = session.metadata.totalPending ?? "";
        try {
          items = JSON.parse(session.metadata.items ?? "[]");
        } catch {
          items = [];
        }
      }
    } catch {
      // Si falla la recuperación, mostramos la página igualmente sin detalles
    }
  }

  return (
    <section className="min-h-screen bg-verde-bosque flex items-center justify-center px-6 py-16">
      <div className="max-w-lg mx-auto w-full">
        <div className="mb-14">
          <div className="flex justify-start mb-8" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
              <path d="M22 74 C16 58 19 28 42 14 C62 2 79 12 84 30 C87 44 79 60 64 68 C49 76 28 84 22 74Z" fill="#FFBC23"/>
            </svg>
          </div>

          <p className="text-crema/30 text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
            Pedido confirmado
          </p>
          <h1 className="text-crema text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            Reserva confirmada
          </h1>
          <p className="text-crema/55 text-base leading-relaxed">
            Gracias{customerName ? `, ${customerName}` : ""}. Tu pedido está
            confirmado y pronto te escribiremos por WhatsApp para coordinar la
            entrega.
          </p>
        </div>

        {(items.length > 0 || deliveryDay) && (
          <div className="border-t border-crema/12 py-10 mb-10">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-crema/28 mb-6">
              Tu pedido
            </p>

            {/* Lista de productos */}
            {items.length > 0 && (
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-baseline">
                    <span className="text-crema/65 text-sm">
                      {item.name}{" "}
                      <span className="text-crema/35">×{item.qty}</span>
                    </span>
                    <span className="text-crema/65 text-sm">
                      {item.price * item.qty} €
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 border-t border-crema/12 pt-4">
              {deliveryDay && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-crema/32">
                    Entrega
                  </span>
                  <span className="text-crema/75 text-sm capitalize">{deliveryDay}</span>
                </div>
              )}
              {totalDeposit && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-crema/32">
                    Reserva pagada
                  </span>
                  <span className="font-semibold text-oro text-sm">{totalDeposit} €</span>
                </div>
              )}
              {totalPending && (
                <div className="flex justify-between items-baseline border-t border-crema/10 pt-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-crema/32">
                    Pendiente al recoger
                  </span>
                  <span className="font-semibold text-crema text-sm">{totalPending} €</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-[10px] font-medium text-crema/22 uppercase tracking-wider mb-10">
          También recibirás un correo de confirmación
        </p>

        <a
          href="/"
          className="inline-block border border-crema/28 text-crema text-[11px] font-semibold tracking-[0.22em] uppercase px-8 py-4 hover:bg-crema hover:text-verde-bosque transition-all duration-300"
        >
          Volver al inicio
        </a>
      </div>
    </section>
  );
}
