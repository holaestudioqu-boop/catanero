function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
  return letters || "?";
}

export function AuthorAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-arena text-[11px] font-semibold text-terracota"
    >
      {initialsOf(name)}
    </span>
  );
}
