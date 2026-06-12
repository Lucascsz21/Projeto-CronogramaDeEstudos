import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon, Sparkles, BookOpen, Clock, Lightbulb, RotateCcw,
  ArrowLeft, GraduationCap, ListOrdered, Plus, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { loadUserPlanos, setActivePlano, updateActivePlano, type Plano, type StoredPlanoEntry } from "@/lib/planoStorage";
import PlanoHistoryPicker from "@/components/PlanoHistoryPicker";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Atividade { conteudo: string; subtopico?: string; tipo: "estudo" | "revisão"; duracao_horas: number; dificuldade: number; concluida?: boolean; }
interface DiaCronograma { data: string; total_horas: number; atividades: Atividade[]; }
interface Trilha { materia: string; subtopicos: string[]; }

const dificuldadeColor = (n: number) => {
  if (n <= 2) return "bg-success/10 text-success border-success/25";
  if (n === 3) return "bg-warning/10 text-warning border-warning/25";
  return "bg-destructive/10 text-destructive border-destructive/25";
};

const CARGAS_ESTUDO: Record<number, string> = {
  1: "Carga Baixa",
  2: "Carga Baixa/Média",
  3: "Carga Média",
  4: "Carga Média/Alta",
  5: "Carga Alta",
};

const Cronograma = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [plano, setPlano] = useState<Plano | null>(null);
  const [historico, setHistorico] = useState<StoredPlanoEntry[]>([]);
  const [activeId, setActiveId] = useState("");

  const loadStorage = (userId: string) => {
    const storage = loadUserPlanos(userId);
    if (!storage) return false;

    const active = storage.planos.find((entry) => entry.id === storage.activeId) ?? storage.planos[0];
    setHistorico(storage.planos);
    setActiveId(active.id);
    setPlano(active.plano);
    return true;
  };

  // Load from localStorage for the current user
  useEffect(() => {
    if (!user?.id) {
      setPlano(null);
      setHistorico([]);
      setActiveId("");
      return;
    }

    if (!loadStorage(user.id)) {
      setPlano(null);
      setHistorico([]);
      setActiveId("");
      toast.info("Você ainda não tem um cronograma ativo. Vamos criar um!");
      navigate("/criar");
    }
  }, [navigate, user?.id]);

  const handleSelectPlano = (planoId: string) => {
    if (!user?.id || planoId === activeId) return;

    const selected = setActivePlano(user.id, planoId);
    if (!selected) return;

    setActiveId(planoId);
    setPlano(selected);
    toast.success("Cronograma alternado com sucesso.");
  };

  if (!plano) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center space-y-4">
          <Sparkles className="h-8 w-8 text-accent animate-pulse mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando seu cronograma...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const atividades = plano.cronograma.flatMap((d) => d.atividades);
  const totalAtividades = atividades.length;
  const atividadesConcluidas = atividades.filter((a) => a.concluida).length;
  
  const totalHoras = atividades.reduce((acc, a) => acc + a.duracao_horas, 0);
  const horasConcluidas = atividades.reduce(
    (acc, a) => acc + (a.concluida ? a.duracao_horas : 0),
    0
  );
  
  const progressoPorcentagem = totalHoras > 0 ? Math.round((horasConcluidas / totalHoras) * 100) : 0;

  const toggleAtividade = (diaIdx: number, atividadeIdx: number) => {
    if (!plano || !user?.id) return;

    const newCronograma = [...plano.cronograma];
    const dia = { ...newCronograma[diaIdx] };
    const atividadesDia = [...dia.atividades];
    const atividade = { ...atividadesDia[atividadeIdx] };

    atividade.concluida = !atividade.concluida;
    atividadesDia[atividadeIdx] = atividade;
    dia.atividades = atividadesDia;
    newCronograma[diaIdx] = dia;

    const novoPlano = { ...plano, cronograma: newCronograma };
    setPlano(novoPlano);
    updateActivePlano(user.id, novoPlano);
    setHistorico((entries) =>
      entries.map((entry) =>
        entry.id === activeId ? { ...entry, plano: novoPlano } : entry
      )
    );

    if (atividade.concluida) {
      toast.success("Atividade concluída! Continue assim. 🚀");
    }
  };

  const handleResetCronograma = () => {
    navigate("/criar");
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden pb-16">
      {/* Decorative background grid */}
      <div className="fixed inset-0 grid-lines pointer-events-none opacity-60" aria-hidden />

      {/* ========== NAV ========== */}
      <nav className="relative z-20">
        <div className="container flex items-center justify-between py-5 md:py-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative h-9 w-9 rounded-xl bg-gradient-hero grid place-items-center shadow-glow">
              <GraduationCap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold tracking-tight">StudySprint</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Study, smarter</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-muted-foreground">Foco total, {user?.name}!</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              Sair
            </Button>
          </div>
        </div>
      </nav>

      {/* ========== CONTAINER ========== */}
      <section className="container py-8 max-w-5xl animate-fade-up">
        {/* Header Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-xs text-muted-foreground hover:text-foreground self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Painel Principal
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-dashed border-destructive/40 text-destructive/90 hover:bg-destructive/10 hover:border-destructive"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Criar Novo Cronograma
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Criar um novo cronograma?</AlertDialogTitle>
                <AlertDialogDescription>
                  Um novo cronograma será gerado e ficará ativo. Mantemos os 2 últimos gerados — o mais antigo será substituído se você já tiver dois salvos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetCronograma} className="bg-destructive hover:bg-destructive/95">
                  Confirmar e Criar Novo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <PlanoHistoryPicker
          entries={historico}
          activeId={activeId}
          onSelect={handleSelectPlano}
          className="mb-8 glass-card rounded-3xl p-5 md:p-6 noise"
        />

        {/* ========== PROGRESS STATS CARD ========== */}
        <div className="glass-card rounded-3xl p-6 md:p-8 noise relative overflow-hidden mb-10">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="chip">
                <CheckCircle className="h-3 w-3" /> Progresso do Sprint
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                Seu progresso de estudos
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Acompanhe o seu progresso diário. Conclua as sessões de estudo e revisões sugeridas pela inteligência artificial.
              </p>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Progresso geral</span>
                  <span className="text-accent">{progressoPorcentagem}% concluído</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-hero transition-all duration-500 ease-out"
                    style={{
                      width: `${progressoPorcentagem}%`,
                      backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))"
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-4 grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-border/60 pt-6 md:pt-0 md:pl-6 text-center md:text-left">
              <div>
                <div className="font-display text-3xl font-bold glow-text">
                  {horasConcluidas}h <span className="text-sm font-normal text-muted-foreground">/ {totalHoras}h</span>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  Horas Estudadas
                </div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold glow-text">
                  {atividadesConcluidas} <span className="text-sm font-normal text-muted-foreground">/ {totalAtividades}</span>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  Tarefas Concluídas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== PLAN RESUMO ========== */}
        <div className="glass-card rounded-3xl p-6 md:p-8 noise relative mb-10 animate-fade-up">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent font-medium mb-4">
            <Sparkles className="h-3 w-3" /> Resumo Estratégico da IA
          </div>
          <p className="serif text-lg md:text-2xl leading-relaxed text-pretty text-foreground/95">
            {plano.resumo_geral}
          </p>
        </div>

        {/* ========== TRILHAS ========== */}
        {plano.trilhas && plano.trilhas.length > 0 && (
          <div className="mb-10">
            <div className="flex items-end justify-between mb-6">
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2.5">
                <ListOrdered className="h-5 w-5 text-accent" /> Trilhas de Aprendizado
              </h3>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Ordem recomendada pela inteligência artificial
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
              {plano.trilhas.map((t, ti) => (
                <div
                  key={ti}
                  className="glass-card rounded-2xl p-5 md:p-6 animate-fade-up"
                  style={{ animationDelay: `${ti * 80}ms` }}
                >
                  <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-border">
                    <div className="h-9 w-9 rounded-xl bg-gradient-hero grid place-items-center shadow-glow flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Matéria</div>
                      <div className="font-display text-lg font-semibold truncate">{t.materia}</div>
                    </div>
                    <Badge variant="outline" className="ml-auto bg-accent/10 border-accent/30 text-accent font-display">
                      {t.subtopicos.length} etapas
                    </Badge>
                  </div>
                  <ol className="space-y-2.5">
                    {t.subtopicos.map((st, si) => (
                      <li key={si} className="flex items-start gap-3 group">
                        <div className="mt-0.5 h-6 w-6 rounded-md bg-secondary/60 border border-border grid place-items-center flex-shrink-0 font-display text-[11px] font-semibold text-accent group-hover:bg-accent/15 group-hover:border-accent/40 transition-colors">
                          {si + 1}
                        </div>
                        <span className="text-sm leading-snug text-foreground/90 text-pretty pt-0.5">{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== CRONOGRAMA ========== */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-6">
            <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2.5">
              <CalendarIcon className="h-5 w-5 text-accent" /> Cronograma de Estudos
            </h3>
            <span className="text-xs text-muted-foreground">{plano.cronograma.length} dias planejados</span>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            {plano.cronograma.map((dia, idx) => {
              const dataFormatada = new Date(dia.data + "T00:00:00");
              const diaConcluido = dia.atividades.every(a => a.concluida);

              return (
                <div
                  key={idx}
                  className={cn(
                    "glass-card rounded-2xl p-5 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 group animate-fade-up",
                    diaConcluido && "border-success/30 bg-success/5"
                  )}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                        {format(dataFormatada, "EEEE", { locale: ptBR })}
                      </div>
                      <div className="font-display text-xl font-semibold mt-0.5">
                        {format(dataFormatada, "dd 'de' MMM", { locale: ptBR })}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-display",
                        diaConcluido
                          ? "bg-success/20 border-success/40 text-success"
                          : "bg-primary/10 border-primary/30 text-foreground"
                      )}
                    >
                      <Clock className="h-3 w-3 mr-1" /> {dia.total_horas}h
                    </Badge>
                  </div>
                  
                  <ul className="space-y-2">
                    {dia.atividades.map((a, ai) => (
                      <li
                        key={ai}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border transition-all",
                          a.concluida
                            ? "bg-secondary/10 border-border/20"
                            : "bg-secondary/30 border-border/40 hover:border-border"
                        )}
                      >
                        <div className="flex items-center h-8 pt-1">
                          <Checkbox
                            checked={!!a.concluida}
                            onCheckedChange={() => toggleAtividade(idx, ai)}
                            className="h-5 w-5 rounded-[6px]"
                          />
                        </div>
                        <div className={cn(
                          "mt-0.5 h-8 w-8 rounded-lg grid place-items-center flex-shrink-0 transition-all",
                          a.tipo === "revisão" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary-foreground",
                          a.concluida && "grayscale opacity-50"
                        )}>
                          {a.tipo === "revisão" ? <RotateCcw className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                        </div>
                        <div className={cn("flex-1 min-w-0 transition-all", a.concluida && "opacity-50")}>
                          <div className={cn("text-sm font-medium truncate", a.concluida && "line-through")}>
                            {a.conteudo}
                          </div>
                          {a.subtopico && (
                            <div className="text-[12px] text-foreground/80 mt-0.5 leading-snug">
                              <span className="serif-italic text-accent">›</span> {a.subtopico}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                            <span className="capitalize">{a.tipo}</span>
                            <span className="opacity-50">•</span>
                            <span>{a.duracao_horas}h</span>
                            <span className="opacity-50">•</span>
                            <span className={cn("px-1.5 py-0.5 rounded border text-[10px]", dificuldadeColor(a.dificuldade))}>
                              {CARGAS_ESTUDO[a.dificuldade] || `N${a.dificuldade}`}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== DICAS ========== */}
        {plano.dicas && plano.dicas.length > 0 && (
          <div className="glass-card rounded-3xl p-6 md:p-8 noise relative animate-fade-up">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-warning font-medium mb-5">
              <Lightbulb className="h-3.5 w-3.5" /> Dicas de Estudo Especiais
            </div>
            <ul className="grid md:grid-cols-2 gap-4">
              {plano.dicas.map((d, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
                  <span className="font-display text-accent text-base font-semibold flex-shrink-0 w-6">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-pretty">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
};

export default Cronograma;
