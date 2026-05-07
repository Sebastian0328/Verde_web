import WaitlistForm from "./WaitlistForm";

interface ClosedStateProps {
  message: string;
}

export default function ClosedState({ message }: ClosedStateProps) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Las reservas de esta semana ya volaron
        </h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-left">
          <p className="font-medium text-gray-900 mb-4 text-center">
            Déjanos tu WhatsApp y te avisamos cuando vuelva el próximo drop de Verde.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
