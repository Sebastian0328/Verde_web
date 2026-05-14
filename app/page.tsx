import Image from "next/image";
import { getAvailableProducts } from "@/lib/products";
import { getProductsRows, getSettings } from "@/lib/google-sheets";
import { storeConfig } from "@/lib/store-config";
import HowItWorks from "@/components/HowItWorks";
import ReservationForm from "@/components/ReservationForm";
import ClosedState from "@/components/ClosedState";
import type { Product } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: Product[] = getAvailableProducts();
  let reservationsOpen = storeConfig.reservationsOpen;

  try {
    const [sheetsProducts, settings] = await Promise.all([
      getProductsRows(),
      getSettings(),
    ]);
    if (sheetsProducts.length > 0) {
      products = sheetsProducts.map((p) => ({
        id: p.productId,
        name: p.name,
        description: p.description,
        finalPrice: p.finalPrice,
        depositAmount: p.depositAmount,
        available: p.available,
        allergens: p.allergens,
        image: p.imageUrl || undefined,
        category: p.category || undefined,
      }));
    }
    reservationsOpen = settings.reservationsOpen;
  } catch {
    // fallback to static config/products
  }

  const config = { ...storeConfig, reservationsOpen };

  return (
    <>
      {/* Hero — imagen arranca desde top:0, detrás del nav fijo */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pb-16 text-center">
        <Image
          src="/Fondo_Home.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay sutil para mejorar contraste del texto */}
        <div className="absolute inset-0 bg-negro/25" />

        {/* pt-16 empuja el contenido por debajo del nav fijo (~64px) */}
        <div className="relative z-10 max-w-xs mx-auto flex flex-col items-center pt-16">
          <p className="animate-fade-in text-crema/60 text-[10px] font-medium tracking-[0.45em] uppercase mb-4">
            Madrid · Dark Kitchen
          </p>

          <div className="animate-fade-in animation-delay-100 flex justify-center mb-4">
            <Image
              src="/iconVerde.png"
              alt="Verde"
              width={180}
              height={180}
              priority
            />
          </div>

          <p className="animate-fade-in animation-delay-200 text-crema text-base font-normal leading-snug mb-1">
            Realiza tus pedidos con antelación.
          </p>

          <p className="animate-fade-in animation-delay-200 text-crema/70 text-sm mb-6">
            Haz tu pedido por reserva y paga online de forma segura.
          </p>

          <div className="animate-fade-in animation-delay-300 w-full">
            {reservationsOpen ? (
              <a
                href="#reservar"
                className="inline-block w-full bg-crema text-verde-bosque text-[11px] font-bold tracking-[0.25em] uppercase px-10 py-5 hover:bg-oro hover:text-negro transition-all duration-300 shadow-lg"
              >
                Hacer mi reserva
              </a>
            ) : (
              <a
                href="#waitlist"
                className="inline-block w-full bg-oro text-negro text-[11px] font-bold tracking-[0.25em] uppercase px-10 py-5 hover:bg-crema transition-all duration-300 shadow-lg"
              >
                Avisarme cuando abra
              </a>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-crema/30 animate-bounce z-10" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* Cómo funciona */}
      <HowItWorks />

      {/* Reserva o estado cerrado */}
      {reservationsOpen ? (
        <section className="bg-crema py-2" id="reservar">
          <ReservationForm products={products} config={config} />
        </section>
      ) : (
        <ClosedState message={storeConfig.closedMessage} />
      )}
    </>
  );
}
