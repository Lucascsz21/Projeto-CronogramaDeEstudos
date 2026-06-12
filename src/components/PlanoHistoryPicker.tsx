import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPlanoResumo, type StoredPlanoEntry } from "@/lib/planoStorage";

interface PlanoHistoryPickerProps {
  entries: StoredPlanoEntry[];
  activeId: string;
  onSelect: (planoId: string) => void;
  className?: string;
}

const PlanoHistoryPicker = ({
  entries,
  activeId,
  onSelect,
  className,
}: PlanoHistoryPickerProps) => {
  if (entries.length <= 1) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
        <History className="h-3.5 w-3.5 text-accent" />
        Seus últimos cronogramas
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {entries.map((entry, index) => {
          const resumo = getPlanoResumo(entry);
          const isActive = entry.id === activeId;

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry.id)}
              className={cn(
                "text-left rounded-2xl border p-4 transition-all",
                isActive
                  ? "border-accent/50 bg-accent/5 shadow-glow"
                  : "border-border/60 bg-secondary/20 hover:border-border hover:bg-secondary/35"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {index === 0 ? "Mais recente" : "Anterior"}
                  </div>
                  <div className="font-display text-sm font-semibold truncate mt-0.5">
                    {resumo.titulo}
                  </div>
                </div>
                {isActive && (
                  <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent shrink-0">
                    Ativo
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span>
                  Gerado em{" "}
                  {format(new Date(entry.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                {resumo.prova && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Prova {format(new Date(resumo.prova + "T00:00:00"), "dd/MM", { locale: ptBR })}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{resumo.dias} dias · {resumo.progresso}%</span>
                <span className={cn("font-medium", isActive ? "text-accent" : "text-foreground/80")}>
                  {isActive ? "Em uso" : "Usar este"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlanoHistoryPicker;
