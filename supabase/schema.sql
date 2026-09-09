-- Catanero — schema inicial + Row Level Security
-- Pegar completo en el SQL Editor de Supabase (proyecto nuevo, plan free).
-- Es idempotente: se puede volver a correr sin romper nada si ya existe.

-- ============================================================
-- Tablas
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create type league_role as enum ('admin', 'player');
exception
  when duplicate_object then null;
end $$;

create table if not exists league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role league_role not null default 'player',
  joined_at timestamptz not null default now(),
  unique (league_id, user_id)
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  played_at timestamptz not null default now(),
  created_by uuid not null references profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  player_id uuid not null references players(id) on delete restrict,
  position smallint not null check (position >= 1),
  catan_points smallint,
  ranking_points numeric(3, 1) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, player_id),
  unique (game_id, position)
);

create table if not exists league_settings (
  league_id uuid primary key references leagues(id) on delete cascade,
  winner_rule text not null default 'half_players',
  last_place_points numeric(3, 1) not null default -0.5,
  middle_place_points numeric(3, 1) not null default 0
);

-- ============================================================
-- Triggers de bootstrapping
-- ============================================================

-- Crea automáticamente el profile al registrarse un usuario (patrón estándar de Supabase).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Al crear una liga, el creador queda como admin automáticamente.
-- Evita el problema de "huevo y gallina" con la policy de league_members
-- (insertar como admin requiere ya ser admin) y evita que el cliente tenga
-- que hacer dos inserts separados y propensos a quedar a medio hacer.
create or replace function handle_new_league()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.league_members (league_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$;

drop trigger if exists on_league_created on leagues;
create trigger on_league_created
  after insert on leagues
  for each row execute function handle_new_league();

-- ============================================================
-- Helper: ¿el usuario actual es admin de esta liga?
-- ============================================================

create or replace function is_league_admin(target_league_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from league_members
    where league_members.league_id = target_league_id
      and league_members.user_id = auth.uid()
      and league_members.role = 'admin'
  );
$$;

create or replace function is_league_member(target_league_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from league_members
    where league_members.league_id = target_league_id
      and league_members.user_id = auth.uid()
  );
$$;

-- ============================================================
-- create_game: inserta una partida + sus resultados en una sola
-- transacción, validando y calculando ranking_points en el servidor.
-- No confía en el cliente para nada de esto (sección 9 y 37 del spec).
-- p_results: [{ "player_id": uuid, "position": int, "catan_points": int|null }, ...]
-- ============================================================

create or replace function create_game(
  p_league_id uuid,
  p_notes text,
  p_results jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_result jsonb;
  v_number_of_players int;
  v_ranking_points numeric(3, 1);
begin
  if not is_league_admin(p_league_id) then
    raise exception 'No tenés permisos de administrador en esta liga';
  end if;

  v_number_of_players := jsonb_array_length(p_results);

  if v_number_of_players < 3 or v_number_of_players > 6 then
    raise exception 'Una partida debe tener entre 3 y 6 jugadores';
  end if;

  if (
    select count(distinct (elem->>'position')::int)
    from jsonb_array_elements(p_results) elem
  ) <> v_number_of_players then
    raise exception 'Las posiciones deben ser únicas';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_results) elem
    where (elem->>'position')::int < 1 or (elem->>'position')::int > v_number_of_players
  ) then
    raise exception 'Posición fuera de rango';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_results) elem
    where not exists (
      select 1 from players
      where players.id = (elem->>'player_id')::uuid
        and players.league_id = p_league_id
    )
  ) then
    raise exception 'Todos los jugadores deben pertenecer a la liga';
  end if;

  insert into games (league_id, notes, created_by)
  values (p_league_id, p_notes, auth.uid())
  returning id into v_game_id;

  for v_result in select * from jsonb_array_elements(p_results)
  loop
    v_ranking_points := case
      when (v_result->>'position')::int = 1 then v_number_of_players / 2.0
      when (v_result->>'position')::int = v_number_of_players then -0.5
      else 0
    end;

    insert into game_results (game_id, player_id, position, catan_points, ranking_points)
    values (
      v_game_id,
      (v_result->>'player_id')::uuid,
      (v_result->>'position')::int,
      (v_result->>'catan_points')::int,
      v_ranking_points
    );
  end loop;

  return v_game_id;
end;
$$;

revoke all on function create_game(uuid, text, jsonb) from public;
grant execute on function create_game(uuid, text, jsonb) to authenticated;

-- ============================================================
-- Invitar jugadores: get_league_preview + join_league.
-- Un usuario autenticado que no es miembro no puede leer "leagues" por
-- RLS, así que necesita una vía explícita para ver el nombre de una
-- liga por slug antes de decidir sumarse, y para sumarse siempre como
-- "player" (nunca admin) sin pasar por la policy de insert de
-- league_members, que exige ya ser admin.
-- ============================================================

create or replace function get_league_preview(p_slug text)
returns table (
  id uuid,
  name text,
  slug text,
  player_count bigint,
  already_member boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select
      l.id,
      l.name,
      l.slug,
      (select count(*) from players p where p.league_id = l.id),
      exists (
        select 1 from league_members lm
        where lm.league_id = l.id and lm.user_id = auth.uid()
      )
    from leagues l
    where l.slug = p_slug;
end;
$$;

revoke all on function get_league_preview(text) from public;
grant execute on function get_league_preview(text) to anon, authenticated;

create or replace function join_league(p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_league_id uuid;
  v_display_name text;
begin
  select id into v_league_id from leagues where slug = p_slug;

  if v_league_id is null then
    raise exception 'No encontramos esa liga';
  end if;

  insert into league_members (league_id, user_id, role)
  values (v_league_id, auth.uid(), 'player')
  on conflict (league_id, user_id) do nothing;

  -- Sumarse a la liga también crea el jugador vinculado a la cuenta:
  -- sin esto, quien se unía por invitación quedaba como miembro (podía
  -- ver todo) pero nunca aparecía en "Jugadores" ni en el ranking,
  -- porque esas pantallas leen de "players", no de "league_members".
  if not exists (
    select 1 from players where league_id = v_league_id and user_id = auth.uid()
  ) then
    select display_name into v_display_name from profiles where id = auth.uid();
    insert into players (league_id, user_id, display_name)
    values (v_league_id, auth.uid(), coalesce(v_display_name, 'Jugador'));
  end if;

  return v_league_id;
end;
$$;

revoke all on function join_league(text) from public;
grant execute on function join_league(text) to authenticated;

-- Backfill: alguien que ya se sumó a una liga antes de este fix quedó
-- como miembro pero sin jugador vinculado. Este insert es idempotente
-- (solo agrega lo que falta), así que es seguro dejarlo acá y volver
-- a correr el schema completo sin duplicar nada.
insert into players (league_id, user_id, display_name)
select lm.league_id, lm.user_id, coalesce(p.display_name, 'Jugador')
from league_members lm
join profiles p on p.id = lm.user_id
where not exists (
  select 1 from players pl
  where pl.league_id = lm.league_id and pl.user_id = lm.user_id
);

-- ============================================================
-- set_member_role: promover/degradar a un miembro registrado dentro
-- de su liga. Solo un admin puede llamarla, y no puede usarla sobre
-- sí mismo (para no quedarse afuera de su propia liga sin querer).
-- ============================================================

create or replace function set_member_role(
  p_league_id uuid,
  p_user_id uuid,
  p_role league_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_league_admin(p_league_id) then
    raise exception 'No tenés permisos de administrador en esta liga';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'No podés cambiar tu propio rol';
  end if;

  update league_members
  set role = p_role
  where league_id = p_league_id and user_id = p_user_id;
end;
$$;

revoke all on function set_member_role(uuid, uuid, league_role) from public;
grant execute on function set_member_role(uuid, uuid, league_role) to authenticated;

-- ============================================================
-- set_own_display_name: un jugador con cuenta cambia su propio
-- nombre visible en una liga. No pasa por la policy de update de
-- "players" (esa exige ser admin) porque acá cualquiera puede tocar
-- su propia fila, nunca la de otro.
-- ============================================================

create or replace function set_own_display_name(p_league_id uuid, p_display_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_display_name is null or length(trim(p_display_name)) = 0 then
    raise exception 'El nombre no puede estar vacío';
  end if;

  update players
  set display_name = trim(p_display_name)
  where league_id = p_league_id and user_id = auth.uid();
end;
$$;

revoke all on function set_own_display_name(uuid, text) from public;
grant execute on function set_own_display_name(uuid, text) to authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table leagues enable row level security;
alter table league_members enable row level security;
alter table players enable row level security;
alter table games enable row level security;
alter table game_results enable row level security;
alter table league_settings enable row level security;

-- profiles: cada usuario ve y edita solo su propio perfil.
drop policy if exists "select_own_profile" on profiles;
create policy "select_own_profile" on profiles for select
  using (id = auth.uid());
drop policy if exists "update_own_profile" on profiles;
create policy "update_own_profile" on profiles for update
  using (id = auth.uid());
drop policy if exists "insert_own_profile" on profiles;
create policy "insert_own_profile" on profiles for insert
  with check (id = auth.uid());

-- leagues: solo miembros pueden verla; solo admins pueden editarla.
drop policy if exists "select_leagues_as_member" on leagues;
create policy "select_leagues_as_member" on leagues for select
  using (is_league_member(id));
drop policy if exists "insert_leagues_authenticated" on leagues;
create policy "insert_leagues_authenticated" on leagues for insert
  with check (created_by = auth.uid());
drop policy if exists "update_leagues_as_admin" on leagues;
create policy "update_leagues_as_admin" on leagues for update
  using (is_league_admin(id));
drop policy if exists "delete_leagues_as_admin" on leagues;
create policy "delete_leagues_as_admin" on leagues for delete
  using (is_league_admin(id));

-- league_members: visible para miembros de la misma liga; solo admin gestiona membresías.
drop policy if exists "select_members_as_member" on league_members;
create policy "select_members_as_member" on league_members for select
  using (is_league_member(league_id));
drop policy if exists "insert_members_as_admin" on league_members;
create policy "insert_members_as_admin" on league_members for insert
  with check (is_league_admin(league_id));
drop policy if exists "delete_members_as_admin" on league_members;
create policy "delete_members_as_admin" on league_members for delete
  using (is_league_admin(league_id));

-- players: visibles para miembros; solo admin crea/edita (incluye jugadores sin cuenta).
drop policy if exists "select_players_as_member" on players;
create policy "select_players_as_member" on players for select
  using (is_league_member(league_id));
drop policy if exists "insert_players_as_admin" on players;
create policy "insert_players_as_admin" on players for insert
  with check (is_league_admin(league_id));
drop policy if exists "update_players_as_admin" on players;
create policy "update_players_as_admin" on players for update
  using (is_league_admin(league_id));
-- Sin policy explícita de delete, un admin no podía sacar un jugador cargado
-- por error. game_results.player_id referencia players(id) on delete restrict,
-- así que un jugador con partidas registradas sigue sin poder borrarse: la
-- policy solo habilita el intento, la integridad la sigue garantizando la FK.
drop policy if exists "delete_players_as_admin" on players;
create policy "delete_players_as_admin" on players for delete
  using (is_league_admin(league_id));

-- games: visibles para miembros; solo admin crea/edita/elimina.
drop policy if exists "select_games_as_member" on games;
create policy "select_games_as_member" on games for select
  using (is_league_member(league_id));
drop policy if exists "insert_games_as_admin" on games;
create policy "insert_games_as_admin" on games for insert
  with check (is_league_admin(league_id));
drop policy if exists "update_games_as_admin" on games;
create policy "update_games_as_admin" on games for update
  using (is_league_admin(league_id));
drop policy if exists "delete_games_as_admin" on games;
create policy "delete_games_as_admin" on games for delete
  using (is_league_admin(league_id));

-- game_results: mismo criterio que games, resuelto vía join.
drop policy if exists "select_results_as_member" on game_results;
create policy "select_results_as_member" on game_results for select
  using (
    exists (
      select 1 from games
      where games.id = game_results.game_id
        and is_league_member(games.league_id)
    )
  );
drop policy if exists "insert_results_as_admin" on game_results;
create policy "insert_results_as_admin" on game_results for insert
  with check (
    exists (
      select 1 from games
      where games.id = game_results.game_id
        and is_league_admin(games.league_id)
    )
  );
drop policy if exists "update_results_as_admin" on game_results;
create policy "update_results_as_admin" on game_results for update
  using (
    exists (
      select 1 from games
      where games.id = game_results.game_id
        and is_league_admin(games.league_id)
    )
  );
drop policy if exists "delete_results_as_admin" on game_results;
create policy "delete_results_as_admin" on game_results for delete
  using (
    exists (
      select 1 from games
      where games.id = game_results.game_id
        and is_league_admin(games.league_id)
    )
  );

-- league_settings: visible para miembros; solo admin edita.
drop policy if exists "select_settings_as_member" on league_settings;
create policy "select_settings_as_member" on league_settings for select
  using (is_league_member(league_id));
drop policy if exists "insert_settings_as_admin" on league_settings;
create policy "insert_settings_as_admin" on league_settings for insert
  with check (is_league_admin(league_id));
drop policy if exists "update_settings_as_admin" on league_settings;
create policy "update_settings_as_admin" on league_settings for update
  using (is_league_admin(league_id));
