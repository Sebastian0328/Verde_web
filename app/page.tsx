import { getAvailableProducts } from "@/lib/products";
import { storeConfig } from "@/lib/store-config";
import HowItWorks from "@/components/HowItWorks";
import ReservationForm from "@/components/ReservationForm";
import ClosedState from "@/components/ClosedState";

export default function HomePage() {
  const products = getAvailableProducts();

  return (
    <>
      {/* Hero */}
      <section className="px-4 py-16 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Verde
        </h1>
        <p className="text-xl text-gray-700 mb-2">
          Bolones hechos bajo pedido para disfrutar el fin de semana.
        </p>
        <p className="text-gray-500">
          Reserva con <strong>1 €</strong> y lo descontamos del precio final
          cuando recibas tu pedido.
        </p>

        {storeConfig.reservationsOpen && (
          <a
            href="#reservar"
            className="inline-block mt-8 bg-gray-900 text-white font-medium px-8 py-3 rounded-md text-sm hover:bg-gray-700 transition-colors"
          >
            Hacer mi reserva
          </a>
        )}
      </section>

      {/* Cómo funciona */}
      <HowItWorks />

      {/* Reserva o estado cerrado */}
      {storeConfig.reservationsOpen ? (
        <ReservationForm products={products} config={storeConfig} />
      ) : (
        <ClosedState message={storeConfig.closedMessage} />
      )}
    </>
  );
}
