import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  tint = "bg-primary/10 text-primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  tint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 py-5">
        <div className="min-w-0">
          <div className="text-muted-foreground text-sm">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            {value}
          </div>
          {sub && <div className="text-muted-foreground mt-1 text-xs">{sub}</div>}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
