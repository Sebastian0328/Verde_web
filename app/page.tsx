import Image from "next/image";
import { getAvailableProducts } from "@/lib/products";
import { getProductsRows, getSettings } from "@/lib/google-sheets";
import { storeConfig } from "@/lib/store-config";
import HowItWorks from "@/components/HowItWorks";
import ReservationForm from "@/components/ReservationForm";
import ClosedState from "@/components/ClosedState";
import type { Product } from "@/lib/products";

export const revalidate = 60;

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
      }));
    }
    reservationsOpen = settings.reservationsOpen;
  } catch {
    // fallback to static config/products
  }

  const config = { ...storeConfig, reservationsOpen };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
        <Image
          src="/Fondo_Home.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="animate-fade-in text-crema text-[10px] font-medium tracking-[0.45em] uppercase mb-10">
            Madrid · Dark Kitchen
          </p>

          <div className="animate-fade-in animation-delay-100 flex justify-center mb-10">
            <Image
              src="/iconVerde.png"
              alt="Verde"
              width={260}
              height={260}
              priority
            />
          </div>

          <p className="animate-fade-in animation-delay-200 text-crema text-lg sm:text-xl font-normal max-w-xs mx-auto leading-relaxed mb-4">
            Realiza tus pedidos con antelación.
          </p>

          <p className="animate-fade-in animation-delay-200 text-crema text-sm mb-14">
            Reserva con{" "}
            <span className="font-semibold text-oro">1 €</span>
            {" "}· se descuenta del precio final.
          </p>

          <div className="animate-fade-in animation-delay-300">
            {reservationsOpen ? (
              <a
                href="#reservar"
                className="inline-block border border-crema/30 text-crema text-[11px] font-semibold tracking-[0.22em] uppercase px-10 py-4 hover:bg-crema hover:text-verde-bosque transition-all duration-300"
              >
                Hacer mi reserva
              </a>
            ) : (
              <a
                href="#waitlist"
                className="inline-block border border-oro/40 text-oro text-[11px] font-semibold tracking-[0.22em] uppercase px-10 py-4 hover:bg-oro hover:text-negro transition-all duration-300"
              >
                Avisarme cuando abra
              </a>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-crema/20 animate-bounce z-10" aria-hidden="true">
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
