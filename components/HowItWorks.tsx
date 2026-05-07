export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Elige tu bolón",
      description: "Selecciona el producto, la cantidad y el día de entrega.",
    },
    {
      number: "2",
      title: "Paga 1 € de reserva",
      description:
        "Confirmamos tu pedido con un abono de 1 €. El resto lo pagas cuando recoges.",
    },
    {
      number: "3",
      title: "Recibe tu pedido el fin de semana",
      description:
        "Te avisamos por WhatsApp para coordinar la entrega. Sin colas, sin sorpresas.",
    },
  ];

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Cómo funciona
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-gray-300 mb-3">{step.number}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
