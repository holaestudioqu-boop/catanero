# Catanero — Modelo de datos

El schema completo (tablas, triggers y políticas de Row Level Security)
vive en [`supabase/schema.sql`](../supabase/schema.sql) — es la fuente de
verdad y se pega tal cual en el SQL Editor de Supabase. Este documento
explica las decisiones detrás de ese archivo.

## Principio rector

Las partidas (`games` + `game_results`) son la única fuente de verdad del
ranking. Ningún jugador tiene un campo `total_points` editable: los puntos se
derivan siempre sumando `game_results.ranking_points`, con la misma lógica
pura ya testeada en
[`src/lib/domain/scoring.ts`](../src/lib/domain/scoring.ts).

## Tablas

| Tabla | Qué representa |
| --- | --- |
| `profiles` | Datos adicionales de un usuario autenticado (1:1 con `auth.users`). |
| `leagues` | Una liga independiente (ej. "Catan Bahía"). |
| `league_members` | Rol (`admin` / `player`) de un usuario registrado dentro de una liga. |
| `players` | Participante de una liga; `user_id` puede ser `null` (jugador sin cuenta). |
| `games` | Una partida jugada dentro de una liga. |
| `game_results` | Posición, puntos de CATAN (opcional) y puntos Catanero de cada jugador en una partida. |
| `league_settings` | Reglas de puntuación de la liga (por ahora, siempre el sistema estándar). |

### Notas de diseño

- `ranking_points` se calcula en el servidor (no se confía en el cliente) y
  se persiste junto al resultado, para poder auditar partidas viejas aunque
  cambien las reglas a futuro. Tipo `numeric(3,1)` para evitar errores de
  floating point en valores como `1.5` y `-0.5`.
- `unique (game_id, position)` impide posiciones duplicadas dentro de una
  partida a nivel de base de datos, no solo en el frontend.
- `players.user_id` nullable es lo que permite jugadores sin cuenta.
- Dos triggers resuelven la integridad transaccional al crear datos:
  - `on_auth_user_created`: crea el `profile` automáticamente al registrarse
    un usuario.
  - `on_league_created`: agrega automáticamente al creador de una liga como
    `admin` en `league_members`. Esto evita que el cliente tenga que hacer
    dos inserts separados (liga + membresía) que podrían quedar a medio
    hacer, y resuelve el problema de "huevo y gallina" de la policy de
    `league_members` (para insertarte como admin, la policy exige que ya
    seas admin).

### Trampa: `INSERT ... RETURNING` contra una policy que depende de un trigger

Al crear una liga desde el cliente, **no** se pide de vuelta la fila insertada
(`.select()` sobre el `.insert()`). Postgres evalúa la policy de `SELECT` de
`leagues` (`is_league_member`) también sobre el `RETURNING`, y el trigger
`on_league_created` que te agrega a `league_members` corre recién *después*
de esa evaluación — el insert queda bloqueado por RLS aunque el propio
`INSERT` sea válido. La solución fue no depender del `RETURNING`: el slug ya
se genera en el cliente antes del insert, así que no hace falta que la DB lo
devuelva. Ver [`src/app/dashboard/actions.ts`](../src/app/dashboard/actions.ts).
Mismo cuidado aplica a cualquier insert futuro cuya visibilidad dependa de
una fila que un trigger crea recién después.

## Row Level Security

Regla general: un usuario solo puede leer filas de ligas donde figura en
`league_members`; escribir (crear partida, editar, eliminar, agregar
jugador, cambiar configuración) requiere `role = 'admin'` en esa liga. Las
funciones `is_league_member()` e `is_league_admin()` en el schema
encapsulan esa verificación para no repetirla en cada policy.

## Aplicar el schema

1. Crear un proyecto nuevo en [supabase.com](https://supabase.com) (plan Free).
2. SQL Editor → pegar el contenido completo de `supabase/schema.sql` → Run.
3. Completar `.env.local` con la URL y la anon key del proyecto (Project
   Settings → API).
