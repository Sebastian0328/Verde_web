import Image from "next/image";

export default function CanceladoPage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-16">
      <Image
        src="/Fondo_Home.png"
        alt=""
        fill
        className="object-cover"
        priority
      />

      {/* Overlay suave */}
      <div className="absolute inset-0 bg-negro/40" />

      <div className="relative z-10 max-w-md mx-auto text-center">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/iconVerde.png"
            alt="Verde"
            width={100}
            height={100}
            priority
          />
        </div>

        <p className="text-crema/50 text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
          Sin cargo
        </p>

        <h1 className="text-crema text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          Tu pedido quedó<br />en pausa
        </h1>

        <p className="text-crema/65 text-base leading-relaxed mb-3">
          No se realizó ningún cargo.
        </p>
        <p className="text-crema/65 text-base leading-relaxed mb-14">
          Puedes volver y terminar tu pedido cuando quieras.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/#reservar"
            className="inline-block bg-crema text-verde-bosque text-[11px] font-semibold tracking-[0.22em] uppercase px-8 py-4 hover:bg-crema/90 transition-all duration-300 text-center"
          >
            Volver a pedir
          </a>
          <a
            href="/"
            className="inline-block border border-crema/30 text-crema text-[11px] font-semibold tracking-[0.22em] uppercase px-8 py-4 hover:border-crema/60 hover:text-crema transition-all duration-300 text-center"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </section>
  );
}
