import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El webhook de Stripe necesita el body raw, no parseado por Next.js
  // Esto se maneja en el propio route handler con request.text()
};

export default nextConfig;
