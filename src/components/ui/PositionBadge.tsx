import { Hexagon } from "@/components/ui/Hexagon";

const fillClasses: Record<number, string> = {
  1: "fill-dorado",
  2: "fill-arena",
  3: "fill-terracota",
};

const textClasses: Record<number, string> = {
  1: "text-carbon",
  2: "text-carbon",
  3: "text-crema",
};

export function PositionBadge({ position }: { position: number }) {
  const isTopThree = position <= 3;

  return (
    <Hexagon
      fillClassName={isTopThree ? fillClasses[position] : "fill-none"}
      textClassName={isTopThree ? textClasses[position] : "text-muted"}
      strokeClassName={isTopThree ? undefined : "text-muted"}
    >
      {position}°
    </Hexagon>
  );
}
