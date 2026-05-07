import { stripe } from "@/lib/stripe";

interface GraciasPageProps {
  searchParams: { session_id?: string };
}

export default async function GraciasPage({ searchParams }: GraciasPageProps) {
  const sessionId = searchParams.session_id;

  let customerName = "";
  let productName = "";
  let deliveryDay = "";
  let depositPaid = "";
  let pendingAmount = "";

  // Recuperar datos de la sesión para mostrar resumen al cliente
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata) {
        customerName = session.metadata.customerName ?? "";
        productName = session.metadata.productName ?? "";
        deliveryDay = session.metadata.deliveryDay ?? "";
        depositPaid = session.metadata.depositPaid ?? "";
        pendingAmount = session.metadata.pendingAmount ?? "";
      }
    } catch {
      // Si falla la recuperación, mostramos la página igualmente sin detalles
    }
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Reserva confirmada!
        </h1>
        <p className="text-gray-600 mb-8">
          Gracias{customerName ? `, ${customerName}` : ""}. Tu pedido está
          confirmado y pronto te escribiremos por WhatsApp para coordinar la
          entrega.
        </p>

        {productName && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-left text-sm mb-8">
            <h2 className="font-semibold text-gray-900 mb-3">Tu pedido</h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Producto</span>
                <span>{productName}</span>
              </div>
              {deliveryDay && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Día de entrega</span>
                  <span className="capitalize">{deliveryDay}</span>
                </div>
              )}
              {depositPaid && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Reserva pagada</span>
                  <span className="font-medium">{depositPaid} €</span>
                </div>
              )}
              {pendingAmount && (
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-500">Pendiente al recoger</span>
                  <span className="font-semibold text-gray-900">{pendingAmount} €</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-6">
          También recibirás un correo de confirmación.
        </p>

        <a
          href="/"
          className="inline-block bg-gray-900 text-white font-medium px-6 py-2.5 rounded-md text-sm hover:bg-gray-700 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </section>
  );
}
