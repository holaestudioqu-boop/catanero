# Catanero — Producto

**Tu liga de Catan.** App para que grupos que juegan Catan seguido registren
partidas, vean un ranking y consulten estadísticas, sin planillas ni
WhatsApp.

## Estado actual

- ✅ Autenticación por email (registro + login) con Supabase Auth.
- ✅ Multi-liga real: cada usuario puede crear y pertenecer a varias ligas,
  con datos completamente aislados entre ellas (Row Level Security).
- ✅ Roles admin / player reales: solo un admin puede registrar partidas,
  agregar jugadores o ver el CTA correspondiente.
- ✅ Jugadores sin cuenta (`user_id` nulo).
- ✅ Reglas de puntuación implementadas, testeadas y validadas también en el
  servidor (no solo en el frontend).
- ⏳ Fuera de esta etapa: editar/eliminar partidas, configuración de la
  liga, estadísticas avanzadas.

## Sistema de puntuación

Para una partida de N jugadores (N entre 3 y 6):

- Ganador (posición 1): `+N/2`
- Último (posición N): `-0.5`
- Intermedios: `0`

Implementado en [`src/lib/domain/scoring.ts`](../src/lib/domain/scoring.ts)
y cubierto por tests en el mismo directorio. La misma regla se revalida en
el servidor dentro de la función `create_game` (ver
[`supabase/schema.sql`](../supabase/schema.sql)): posiciones únicas y
consecutivas, entre 3 y 6 jugadores, todos pertenecientes a la liga.

## Principio de ranking

El ranking se deriva siempre de las partidas registradas (`games` +
resultados), nunca de un contador editable. Ver
[`src/lib/domain/ranking.ts`](../src/lib/domain/ranking.ts).

## Pantallas implementadas

| Pantalla | Ruta |
| --- | --- |
| Landing | `/` |
| Login / registro | `/login` |
| Mis ligas | `/dashboard` |
| Home de liga / Ranking | `/league/[slug]` |
| Nueva partida (wizard 4 pasos) | `/league/[slug]/new-game` |
| Historial de partidas | `/league/[slug]/games` |
| Detalle de partida | `/league/[slug]/games/[gameId]` |
| Jugadores | `/league/[slug]/players` |
| Perfil de jugador | `/league/[slug]/players/[playerId]` |
| Estadísticas | `/league/[slug]/stats` |

## Fuera de alcance por ahora

Edición/eliminación de partidas, configuración de reglas de la liga, chat,
notificaciones, logros, temporadas, OAuth (Google). Ver el prompt original
del producto para el detalle completo de qué queda fuera del MVP.
