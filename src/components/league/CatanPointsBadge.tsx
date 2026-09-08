import { Hexagon } from "@/components/ui/Hexagon";

export function CatanPointsBadge({
  points,
  size = "sm",
}: {
  points: number;
  size?: "sm" | "md";
}) {
  return (
    <Hexagon textClassName="text-naranja" strokeClassName="text-naranja" size={size}>
      {points}
    </Hexagon>
  );
}
