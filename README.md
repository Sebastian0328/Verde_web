# Verde — Web de preventa

MVP funcional para la dark kitchen Verde. Preventa semanal con reserva de 1 € vía Stripe, confirmación por webhook, registro en Google Sheets y emails automáticos con Resend.

---

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS**
- **Stripe Checkout** — pago del abono de reserva
- **Stripe Webhooks** — confirmación del pedido
- **Google Sheets API** — panel operativo
- **Resend** — emails transaccionales
- **Zod** — validación de datos en backend
- **Vercel** — hosting

---

## Instalación

```bash
npm install
```

Copia el archivo de variables de entorno:

```bash
cp .env.example .env.local
```

Rellena `.env.local` con tus credenciales reales (ver secciones abajo).

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe (`whsec_...`) |
| `RESEND_API_KEY` | API key de Resend |
| `RESEND_FROM_EMAIL` | Email remitente (verificado en Resend) |
| `VERDE_TEAM_EMAIL` | Email interno del equipo Verde |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Email de la cuenta de servicio de Google |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Clave privada de la cuenta de servicio |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ID de la hoja de cálculo |
| `NEXT_PUBLIC_APP_URL` | URL base de la app (`http://localhost:3000` en dev) |

---

## Configurar Stripe

1. Crea una cuenta en [stripe.com](https://stripe.com) si no tienes.
2. Ve a **Developers > API Keys** y copia tu `Secret key` (modo test).
3. Pégala en `STRIPE_SECRET_KEY` en tu `.env.local`.

---

## Configurar el webhook de Stripe en local

Instala la [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe
```

Autentícate:

```bash
stripe login
```

Escucha eventos y reenvía al servidor local:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Copia el `whsec_...` que aparece en la consola y pégalo en `STRIPE_WEBHOOK_SECRET`.

> Deja este comando corriendo mientras desarrollas.

---

## Configurar Google Sheets

### 1. Crear proyecto en Google Cloud

1. Ve a [console.cloud.google.com](https://console.cloud.google.com).
2. Crea un nuevo proyecto (o usa uno existente).
3. Activa la **Google Sheets API**:
   - APIs & Services > Library > busca "Google Sheets API" > Enable.

### 2. Crear cuenta de servicio

1. IAM & Admin > Service Accounts > Create Service Account.
2. Dale un nombre (ej. `verde-sheets`).
3. En el paso de permisos, selecciona el rol **Editor** (o solo "Sheets Editor" si prefieres mínimos permisos).
4. Crea y descarga una clave JSON: Actions > Manage keys > Add key > JSON.

### 3. Copiar credenciales

Del JSON descargado:
- `client_email` → `GOOGLE_SHEETS_CLIENT_EMAIL`
- `private_key` → `GOOGLE_SHEETS_PRIVATE_KEY`

> En Vercel: pega la clave privada completa incluyendo `-----BEGIN PRIVATE KEY-----` y los saltos de línea como `\n`. El código los convierte automáticamente.

### 4. Preparar la hoja de cálculo

1. Crea una Google Spreadsheet nueva.
2. Crea dos pestañas:
   - `Pedidos` — con estas cabeceras en la fila 1:
     ```
     Created At | Status | Stripe Session ID | Customer Name | Email | Phone | Product ID | Product Name | Quantity | Delivery Day | Notes | Final Price | Deposit Paid | Pending Amount
     ```
   - `Waitlist` — con estas cabeceras:
     ```
     Created At | Name | Email | Phone | Message
     ```
3. Comparte la hoja con el `client_email` de la cuenta de servicio con permiso de **Editor**.
4. Copia el ID de la hoja desde la URL y pégalo en `GOOGLE_SHEETS_SPREADSHEET_ID`.

---

## Configurar Resend

1. Crea una cuenta en [resend.com](https://resend.com).
2. Verifica tu dominio (o usa el dominio sandbox `@resend.dev` en desarrollo).
3. Crea una API Key en el dashboard.
4. Copia la key en `RESEND_API_KEY`.
5. Pon en `RESEND_FROM_EMAIL` el email desde el que se enviarán los correos.
6. Pon en `VERDE_TEAM_EMAIL` el email donde quieres recibir las notificaciones internas.

---

## Ejecutar en local

```bash
npm run dev
```

La app estará en `http://localhost:3000`.

> Recuerda tener corriendo `stripe listen` en otra terminal para recibir webhooks.

---

## Gestionar productos y configuración

- **Productos**: edita `/lib/products.ts`. Cada producto tiene `id`, `name`, `description`, `finalPrice`, `depositAmount`, `available`.
- **Abrir/cerrar reservas**: cambia `reservationsOpen` en `/lib/store-config.ts`.
- **Días de entrega**: edita `deliveryDays` en el mismo archivo.
- **Máximo por pedido**: `maxQuantityPerOrder`.

---

## Desplegar en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com).
2. En **Settings > Environment Variables**, añade todas las variables de `.env.example` con sus valores reales.
3. Para `GOOGLE_SHEETS_PRIVATE_KEY`, pega el valor completo con los `\n` literales — Vercel los gestiona correctamente.
4. Despliega.

### Configurar el webhook de Stripe en producción

1. En el [dashboard de Stripe](https://dashboard.stripe.com/webhooks) ve a **Developers > Webhooks > Add endpoint**.
2. URL del endpoint: `https://tudominio.vercel.app/api/stripe-webhook`
3. Selecciona el evento: `checkout.session.completed`
4. Copia el `Signing secret` y ponlo en `STRIPE_WEBHOOK_SECRET` en Vercel.

---

## Estructura del proyecto

```
/app
  page.tsx                              # Página principal
  /gracias/page.tsx                     # Página tras pago exitoso
  /cancelado/page.tsx                   # Página tras cancelar
  /api/create-checkout-session/route.ts # Crea sesión Stripe
  /api/stripe-webhook/route.ts          # Procesa confirmación Stripe
  /api/waitlist/route.ts                # Registro lista de espera

/lib
  stripe.ts         # Cliente de Stripe
  products.ts       # Catálogo de productos
  store-config.ts   # Config de la tienda (open/closed, días, etc.)
  google-sheets.ts  # Helpers para escribir en Google Sheets
  email.ts          # Helpers de email con Resend
  validators.ts     # Schemas Zod

/components
  ProductCard.tsx      # Tarjeta de producto
  ReservationForm.tsx  # Formulario completo de reserva
  ClosedState.tsx      # Vista cuando las reservas están cerradas
  HowItWorks.tsx       # Sección explicativa del proceso
  WaitlistForm.tsx     # Formulario de lista de espera
```

---

## Seguridad

- El precio nunca se calcula ni se confía en el frontend. El backend recibe solo `productId` y `quantity`, y calcula todos los importes.
- La firma del webhook de Stripe se verifica en cada llamada.
- No se guardan datos de tarjeta en ningún momento (Stripe Checkout alojado).
- Todas las claves están en variables de entorno, nunca en el código.
# Verde_web
