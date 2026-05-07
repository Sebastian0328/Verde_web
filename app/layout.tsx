import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verde — Bolones bajo pedido",
  description:
    "Reserva tus bolones hechos a mano. Preventa semanal con entrega el fin de semana.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900 antialiased">
        {/* Header mínimo — aquí irá el branding definitivo */}
        <header className="border-b border-gray-100 px-4 py-4">
          <div className="max-w-5xl mx-auto">
            <span className="text-xl font-bold tracking-tight">Verde</span>
          </div>
        </header>

        <main>{children}</main>

        {/* Footer mínimo */}
        <footer className="border-t border-gray-100 mt-16 px-4 py-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Verde — Todos los derechos reservados
        </footer>
      </body>
    </html>
  );
}
