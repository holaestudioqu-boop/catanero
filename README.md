# Catanero

Tu liga de Catan: registrá partidas, seguí el ranking y las estadísticas de
tu grupo. Ver [`docs/PRODUCT.md`](docs/PRODUCT.md) para el resumen funcional
y [`docs/DATABASE.md`](docs/DATABASE.md) para el modelo de datos.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Vitest para la lógica de dominio (reglas de puntuación y ranking)
- Supabase Free (autenticación + PostgreSQL)
- Costo de infraestructura durante el MVP: **$0/mes**

## Estado

Conectado a Supabase de punta a punta: autenticación por email, multi-liga
con datos aislados por RLS, roles admin/player reales, y el flujo completo
de registrar partida validado también en el servidor (función `create_game`
en Postgres, no solo en el frontend).

## Instalación

```bash
npm install
cp .env.example .env.local   # completar con tu proyecto de Supabase, ver abajo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000), creá una cuenta desde
`/login` y armá tu primera liga desde `/dashboard`.

## Setup de Supabase (plan Free)

1. Crear una cuenta y un proyecto nuevo en [supabase.com](https://supabase.com)
   (no pide tarjeta para el plan Free).
2. En el proyecto: **SQL Editor** → pegar el contenido completo de
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**. Crea las tablas,
   los triggers, la función `create_game` y las políticas de RLS. El
   archivo es idempotente: se puede volver a correr sin romper nada.
3. **Project Settings → API**: copiar `Project URL` y la `anon` / `publishable` key.
4. **Authentication → URL Configuration**: poner el `Site URL` apuntando a
   donde corre la app (ej. `http://localhost:3210` si usás ese puerto) y
   agregar esa misma URL con `/**` a `Redirect URLs` — si no, el link de
   confirmación de email no vuelve a la app.
5. Completar `.env.local` con la URL y la key del paso 3.

No hay que tocar la `service_role key` (es secreta, bypassa RLS por
completo y no se usa en esta etapa).

### Nota sobre el envío de emails de confirmación

El servicio de email incluido en Supabase Free tiene un límite muy bajo
(pocos correos por hora). Para desarrollo, si un registro no llega, se
puede confirmar el usuario manualmente desde **Authentication → Users** en
el dashboard, sin depender del correo.

## Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run lint     # ESLint
npm run test     # tests de la lógica de dominio (Vitest)
```

## Estructura

```
src/
  app/                  # rutas (App Router)
    login/               # login, registro, server actions de auth
    dashboard/           # listado de ligas del usuario + crear liga
    auth/confirm/        # callback que canjea el code de confirmación por sesión
    league/[slug]/       # ranking, nueva partida, historial, jugadores, stats
  components/
    ui/                  # Button, Card, EmptyState, etc.
    auth/                # formulario de login/registro
    dashboard/           # formulario de crear liga
    league/              # componentes específicos de una liga
  lib/
    domain/              # reglas de negocio puras (scoring, ranking) + tests
    data/                # queries de lectura contra Supabase (memoizadas por request)
    supabase/            # clientes de Supabase (browser, server, proxy/middleware)
docs/
  PRODUCT.md             # resumen funcional
  DATABASE.md            # modelo de datos y decisiones de diseño
supabase/
  schema.sql             # tablas, triggers, función create_game y RLS
```

## Sistema de puntuación

Para una partida de N jugadores (3 a 6):

- Ganador: `+N/2`
- Último: `-0.5`
- Intermedios: `0`

El ranking siempre se deriva de las partidas registradas, nunca de un
contador editable por jugador. La regla está implementada en
[`src/lib/domain`](src/lib/domain) (con tests) y revalidada en el servidor
por la función `create_game` del schema — el cliente nunca es la única
fuente de verdad para esto.

## Deploy gratuito

Pendiente para la etapa siguiente: Cloudflare Pages/Workers o Vercel Hobby,
con subdominio gratuito (sin comprar dominio propio durante el MVP).
