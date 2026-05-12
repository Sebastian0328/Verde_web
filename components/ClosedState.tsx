import WaitlistForm from "./WaitlistForm";

interface ClosedStateProps {
  message: string;
}

export default function ClosedState({ message }: ClosedStateProps) {
  return (
    <section className="py-24 px-6 bg-verde-bosque min-h-[70vh] flex items-center" id="waitlist">
      <div className="max-w-xl mx-auto w-full">
        <div className="mb-16">
          <p className="text-crema/30 text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
            Reservas cerradas
          </p>
          <h2 className="text-crema text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            Las reservas ya volaron
          </h2>
          <p className="text-crema/55 text-base leading-relaxed max-w-sm">
            {message}
          </p>
        </div>

        <div className="border-t border-crema/12 pt-12">
          <h3 className="text-crema text-xl font-semibold mb-2">
            Únete al próximo drop
          </h3>
          <p className="text-crema/45 text-sm mb-8">
            Déjanos tu WhatsApp y te avisamos cuando vuelva el próximo drop de Verde.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
