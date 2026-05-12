export default function CanceladoPage() {
  return (
    <section className="min-h-screen bg-crema flex items-center justify-center px-6 py-16">
      <div className="max-w-md mx-auto">
        <p className="text-negro/28 text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
          Sin cobrar
        </p>
        <h1 className="text-verde-bosque text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          Sin cobrar,<br />sin drama.
        </h1>
        <p className="text-negro/50 text-base leading-relaxed mb-14">
          No te hemos cobrado nada. Puedes volver a intentarlo cuando quieras.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/#reservar"
            className="inline-block bg-verde-bosque text-crema text-[11px] font-semibold tracking-[0.22em] uppercase px-8 py-4 hover:bg-verde-platano transition-all duration-300 text-center"
          >
            Volver a intentar
          </a>
          <a
            href="/"
            className="inline-block border border-negro/18 text-negro/50 text-[11px] font-semibold tracking-[0.22em] uppercase px-8 py-4 hover:border-negro/35 hover:text-negro transition-all duration-300 text-center"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </section>
  );
}
