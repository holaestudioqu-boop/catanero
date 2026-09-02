"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";

interface BottomNavProps {
  slug: string;
}

const items = [
  { key: "ranking", label: "Ranking", href: (slug: string) => `/league/${slug}` },
  { key: "games", label: "Partidas", href: (slug: string) => `/league/${slug}/games` },
  { key: "new-game", label: "Nueva", href: (slug: string) => `/league/${slug}/new-game` },
  { key: "stats", label: "Stats", href: (slug: string) => `/league/${slug}/stats` },
  { key: "players", label: "Jugadores", href: (slug: string) => `/league/${slug}/players` },
] as const;

function isActive(pathname: string, href: string, slug: string) {
  if (href === `/league/${slug}`) return pathname === href;
  return pathname.startsWith(href);
}

export function BottomNav({ slug }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación de la liga"
      className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-md items-end justify-between px-2 pt-2">
        {items.map((item) => {
          const href = item.href(slug);
          const active = isActive(pathname, href, slug);

          if (item.key === "new-game") {
            return (
              <Link
                key={item.key}
                href={href}
                className="flex flex-1 flex-col items-center gap-1 focus-visible:outline-none"
                aria-label="Registrar partida"
              >
                <span
                  className={clsx(
                    "-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform",
                    active && "scale-105"
                  )}
                >
                  <PlusIcon />
                </span>
                <span className="text-[11px] font-medium text-foreground">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.key}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-current={active ? "page" : undefined}
            >
              <span
                className={clsx(
                  "h-1.5 w-1.5 rounded-full",
                  active ? "bg-primary" : "bg-transparent"
                )}
              />
              <span className={active ? "text-primary" : "text-muted"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
