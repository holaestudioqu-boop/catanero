"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PointsPill } from "@/components/league/PointsPill";
import { MAX_PLAYERS, MIN_PLAYERS, calculateRankingPoints } from "@/lib/domain/scoring";
import type { Game, Player } from "@/lib/domain/types";
import { createGameAction } from "@/app/league/[slug]/actions";

type Step = 1 | 2 | 3 | 4 | 5;

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= list.length) return list;
  const next = [...list];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

interface NewGameWizardProps {
  leagueId: string;
  slug: string;
  players: Player[];
}

export function NewGameWizard({ leagueId, slug, players }: NewGameWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [catanPoints, setCatanPoints] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedGame, setSavedGame] = useState<Game | null>(null);
  const submittedRef = useRef(false);

  const nameOf = useMemo(() => {
    const map = new Map(players.map((p) => [p.id, p.displayName]));
    return (id: string) => map.get(id) ?? id;
  }, [players]);

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      if (current.length >= MAX_PLAYERS) return current;
      return [...current, id];
    });
  }

  function goToStep2() {
    setOrder(selectedIds);
    setStep(2);
  }

  async function handleSave() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setSaveError(null);

    const results = order.map((playerId, index) => {
      const raw = catanPoints[playerId]?.trim();
      const parsed = raw ? Number(raw) : undefined;
      return {
        playerId,
        position: index + 1,
        catanPoints: parsed != null && !Number.isNaN(parsed) ? parsed : undefined,
      };
    });

    const { gameId, error } = await createGameAction(leagueId, slug, results);

    if (error || !gameId) {
      setSaveError(error ?? "No pudimos guardar la partida. Probá de nuevo.");
      setSubmitting(false);
      submittedRef.current = false;
      return;
    }

    setSavedGame({ id: gameId, playedAt: new Date().toISOString(), results });
    setSubmitting(false);
    setStep(5);
  }

  return (
    <div className="flex flex-col gap-6">
      {step < 5 ? (
        <header className="flex items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-black/[.04] dark:hover:bg-white/[.06]"
              aria-label="Volver"
            >
              <BackIcon />
            </button>
          ) : null}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Paso {step} de 4
            </p>
            <h1 className="text-xl font-semibold">
              {step === 1 && "¿Quiénes jugaron?"}
              {step === 2 && "Orden final"}
              {step === 3 && "Puntos de CATAN"}
              {step === 4 && "Confirmar partida"}
            </h1>
          </div>
        </header>
      ) : null}

      {step === 1 ? (
        <PlayerSelectStep
          playerIds={players.map((p) => p.id)}
          nameOf={nameOf}
          selectedIds={selectedIds}
          onToggle={toggleSelected}
          onContinue={goToStep2}
        />
      ) : null}

      {step === 2 ? (
        <OrderStep
          order={order}
          nameOf={nameOf}
          onMove={(index, direction) => setOrder((o) => moveItem(o, index, direction))}
          onContinue={() => setStep(3)}
        />
      ) : null}

      {step === 3 ? (
        <CatanPointsStep
          order={order}
          nameOf={nameOf}
          values={catanPoints}
          onChange={(id, value) => setCatanPoints((c) => ({ ...c, [id]: value }))}
          onContinue={() => setStep(4)}
        />
      ) : null}

      {step === 4 ? (
        <ConfirmStep
          order={order}
          nameOf={nameOf}
          catanPoints={catanPoints}
          submitting={submitting}
          error={saveError}
          onSave={handleSave}
        />
      ) : null}

      {step === 5 && savedGame ? (
        <SavedStep slug={slug} game={savedGame} nameOf={nameOf} />
      ) : null}
    </div>
  );
}

function PlayerSelectStep({
  playerIds,
  nameOf,
  selectedIds,
  onToggle,
  onContinue,
}: {
  playerIds: string[];
  nameOf: (id: string) => string;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
}) {
  const count = selectedIds.length;
  const canContinue = count >= MIN_PLAYERS && count <= MAX_PLAYERS;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {playerIds.map((id) => {
          const selected = selectedIds.includes(id);
          const disabled = !selected && count >= MAX_PLAYERS;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              disabled={disabled}
              aria-pressed={selected}
              className={`flex min-h-14 items-center gap-2 rounded-2xl border px-4 text-left text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-foreground hover:bg-black/[.02] dark:hover:bg-white/[.03]"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {selected ? "✓" : ""}
              </span>
              {nameOf(id)}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-muted">
        {count} {count === 1 ? "jugador seleccionado" : "jugadores seleccionados"}
        {count > 0 && !canContinue ? ` · mínimo ${MIN_PLAYERS}, máximo ${MAX_PLAYERS}` : ""}
      </p>

      <Button fullWidth disabled={!canContinue} onClick={onContinue}>
        Continuar
      </Button>
    </div>
  );
}

function OrderStep({
  order,
  nameOf,
  onMove,
  onContinue,
}: {
  order: string[];
  nameOf: (id: string) => string;
  onMove: (index: number, direction: -1 | 1) => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">Ordenalos según cómo terminó la partida.</p>
      <ol className="flex flex-col gap-2">
        {order.map((id, index) => (
          <li key={id}>
            <Card className="flex items-center gap-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[.05] text-sm font-semibold dark:bg-white/[.08]">
                {index + 1}°
              </span>
              <span className="flex-1 text-[15px] font-medium">{nameOf(id)}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  aria-label={`Subir a puesto ${index}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-black/[.04] disabled:opacity-30 dark:hover:bg-white/[.06]"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === order.length - 1}
                  aria-label={`Bajar a puesto ${index + 2}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-black/[.04] disabled:opacity-30 dark:hover:bg-white/[.06]"
                >
                  ↓
                </button>
              </div>
            </Card>
          </li>
        ))}
      </ol>
      <Button fullWidth onClick={onContinue}>
        Continuar
      </Button>
    </div>
  );
}

function CatanPointsStep({
  order,
  nameOf,
  values,
  onChange,
  onContinue,
}: {
  order: string[];
  nameOf: (id: string) => string;
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Opcional. Si nadie los recuerda, dejalos en blanco y guardá igual.
      </p>
      <div className="flex flex-col gap-2">
        {order.map((id) => (
          <Card key={id} className="flex items-center justify-between gap-3 py-2.5">
            <label htmlFor={`catan-points-${id}`} className="text-[15px] font-medium">
              {nameOf(id)}
            </label>
            <input
              id={`catan-points-${id}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              placeholder="—"
              value={values[id] ?? ""}
              onChange={(e) => onChange(id, e.target.value)}
              className="h-10 w-20 rounded-xl border border-border bg-background px-3 text-right text-[15px] tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </Card>
        ))}
      </div>
      <Button fullWidth onClick={onContinue}>
        Continuar
      </Button>
    </div>
  );
}

function ConfirmStep({
  order,
  nameOf,
  catanPoints,
  submitting,
  error,
  onSave,
}: {
  order: string[];
  nameOf: (id: string) => string;
  catanPoints: Record<string, string>;
  submitting: boolean;
  error: string | null;
  onSave: () => void;
}) {
  const numberOfPlayers = order.length;
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2">
        {order.map((id, index) => {
          const position = index + 1;
          const points = calculateRankingPoints(position, numberOfPlayers);
          const raw = catanPoints[id]?.trim();
          return (
            <div key={id} className="flex items-center justify-between text-[15px]">
              <span>
                {position}° {nameOf(id)}
                {raw ? <span className="text-muted"> — {raw} pts</span> : null}
              </span>
              <PointsPill value={points} />
            </div>
          );
        })}
      </Card>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button fullWidth onClick={onSave} disabled={submitting}>
        {submitting ? "Guardando…" : "Guardar partida"}
      </Button>
    </div>
  );
}

function SavedStep({
  slug,
  game,
  nameOf,
}: {
  slug: string;
  game: Game;
  nameOf: (id: string) => string;
}) {
  const router = useRouter();
  const winner = game.results.find((r) => r.position === 1);
  const winnerPoints = winner
    ? calculateRankingPoints(winner.position, game.results.length)
    : 0;

  return (
    <div className="flex flex-col items-center gap-4 pt-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-2xl">
        🏆
      </span>
      <div>
        <h1 className="text-xl font-semibold">Partida registrada</h1>
        {winner ? (
          <p className="mt-1 text-muted">
            {nameOf(winner.playerId)} ganó y suma <PointsPill value={winnerPoints} /> puntos.
          </p>
        ) : null}
      </div>
      <div className="flex w-full flex-col gap-2 pt-4">
        <Button fullWidth onClick={() => router.push(`/league/${slug}`)}>
          Ver ranking actualizado
        </Button>
        <Button
          fullWidth
          variant="secondary"
          onClick={() => router.push(`/league/${slug}/games/${game.id}`)}
        >
          Ver partida
        </Button>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
