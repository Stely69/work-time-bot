# WorkTime Bot

Bot de Telegram para control personal de horas laborales y cálculo aproximado de pagos.

## Stack
- **Runtime:** Bun + Cloudflare Workers
- **Lenguaje:** TypeScript
- **Web framework:** Hono
- **Bot framework:** grammY
- **ORM:** Drizzle ORM
- **DB:** Cloudflare D1 (SQLite)

## Requisitos
- [Bun](https://bun.sh)
- Cuenta en Cloudflare
- Token de bot de [@BotFather](https://t.me/BotFather)

## Comandos

| Comando | Descripción |
|---------|-------------|
| `entrada` | Registra inicio del turno |
| `salida` | Finaliza turno, calcula horas y pago |
| `/hoy` | Resumen del día actual |
| `/quincena` | Resumen del periodo de pago (11-25 / 26-10) |
| `/historial` | Últimos 10 turnos registrados |
| `/tarifa <valor>` | Configura el valor de la hora base (COP) |

## Instalación y despliegue

```bash
# Clonar e instalar
git clone <repo>
cd worktime-bot
cp .env.example .dev.vars
# Editar .dev.vars con tu BOT_TOKEN de @BotFather
bun install

# Crear base de datos D1
bunx wrangler d1 create worktime-db
# → Copiar el database_id a wrangler.jsonc

# Aplicar migraciones
bun run db:migrate:remote

# Configurar token en producción
bunx wrangler secret put BOT_TOKEN

# Desplegar
bun run deploy

# Configurar webhook (una vez)
curl -X POST "https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://<TU_WORKER>.workers.dev/webhook"
```

## Reglas de cálculo

| Concepto | Horario | Recargo |
|----------|---------|---------|
| Jornada ordinaria | 6:00 AM – 7:00 PM | Base |
| Jornada nocturna | 7:00 PM – 6:00 AM | +35% |
| Horas extras (>8h diarias) | — | +25% |
| Festivos | — | +75% |
| Dominicales | — | +75% |

- **Horas extras nocturnas**: recargo combinado (nocturno + extra)
- **Periodo de pago**: quincenas del 11-25 y 26-10 del mes siguiente
- **Zona horaria**: Colombia (UTC-5)
- **Festivos**: Ley Emiliani + Pascua (cálculo automático)

## Estructura del proyecto

```
src/
├── index.ts                    # Entry point: Hono + webhook handler
├── bot/
│   ├── client.ts               # grammY Bot + middleware DB
│   ├── keyboards.ts            # Botones persistentes
│   └── handlers/               # entrada, salida, hoy, quincena, historial, tarifa
├── db/
│   ├── schema.ts               # Drizzle ORM schema
│   ├── index.ts                # Conexión D1
│   └── migrations/             # Migraciones SQL
├── services/
│   ├── calculator.ts           # Lógica de clasificación de horas
│   ├── colombian-holidays.ts   # Festivos Colombia
│   ├── payment.ts              # Cálculo de pago
│   └── periods.ts              # Lógica de periodos (quincenas)
└── utils/
    ├── date.ts                 # Utilidades UTC + Colombia (UTC-5)
    ├── messages.ts             # Templates de respuesta
    └── numbers.ts              # Formateo COP
```

## Licencia
MIT
