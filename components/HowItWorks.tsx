export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Elige tu producto",
      description: "Selecciona el que mas te guste, la cantidad y el día de entrega.",
    },
    {
      number: "02",
      title: "Paga 1 € de reserva",
      description:
        "Confirmamos tu pedido con un abono de 1 €. El resto lo pagas cuando recibes tu pedido.",
    },
    {
      number: "03",
      title: "Recibe el dia que tu elijas",
      description:
        "Te avisamos por WhatsApp y correo electrónico para coordinar la entrega. No te preocupes, no hay colas, no hay sorpresas.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-negro">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <p className="text-crema/30 text-[10px] font-medium tracking-[0.4em] uppercase mb-3">
            El proceso
          </p>
          <h2 className="text-crema text-3xl sm:text-4xl font-bold tracking-tight">
            Cómo funciona
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 divide-y divide-crema/10 sm:divide-y-0 sm:divide-x sm:divide-crema/10">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`py-8 sm:py-0 ${i > 0 ? "sm:pl-10" : ""} ${i < steps.length - 1 ? "sm:pr-10" : ""}`}
            >
              <p className="text-crema/18 text-xs font-medium tracking-widest mb-6">
                {step.number}
              </p>
              <h3 className="text-crema text-base font-semibold mb-3 leading-snug">
                {step.title}
              </h3>
              <p className="text-crema/45 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
