export default function CanceladoPage() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="text-5xl mb-6">↩️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Reserva cancelada
        </h1>
        <p className="text-gray-600 mb-8">
          No te hemos cobrado nada. Puedes volver a intentarlo cuando quieras.
        </p>
        <a
          href="/#reservar"
          className="inline-block bg-gray-900 text-white font-medium px-6 py-2.5 rounded-md text-sm hover:bg-gray-700 transition-colors"
        >
          Volver a intentar
        </a>
      </div>
    </section>
  );
}
