import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon, Sparkles, BookOpen, Clock, RotateCcw, ArrowRight,
  Brain, Zap, Target, GraduationCap, Calendar, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadUserPlanos, setActivePlano, type Plano, type StoredPlanoEntry } from "@/lib/planoStorage";
import PlanoHistoryPicker from "@/components/PlanoHistoryPicker";
import { useAuth } from "@/contexts/AuthContext";

interface Atividade { conteudo: string; subtopico?: string; tipo: "estudo" | "revisão"; duracao_horas: number; dificuldade: number; concluida?: boolean; }
interface DiaCronograma { data: string; total_horas: number; atividades: Atividade[]; }

const Index = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [plano, setPlano] = useState<Plano | null>(null);
  const [historico, setHistorico] = useState<StoredPlanoEntry[]>([]);
  const [activeId, setActiveId] = useState("");

  // Load from localStorage for the current user
  useEffect(() => {
    if (!user?.id) {
      setPlano(null);
      setHistorico([]);
      setActiveId("");
      return;
    }

    const storage = loadUserPlanos(user.id);
    if (!storage) {
      setPlano(null);
      setHistorico([]);
      setActiveId("");
      return;
    }

    const active = storage.planos.find((entry) => entry.id === storage.activeId) ?? storage.planos[0];
    setHistorico(storage.planos);
    setActiveId(active.id);
    setPlano(active.plano);
  }, [user?.id]);

  const handleSelectPlano = (planoId: string) => {
    if (!user?.id || planoId === activeId) return;

    const selected = setActivePlano(user.id, planoId);
    if (!selected) return;

    setActiveId(planoId);
    setPlano(selected);
  };

  // Calculate statistics for active plan
  let totalHoras = 0;
  let horasConcluidas = 0;
  let progressoPorcentagem = 0;
  let proximoDiaFoco: DiaCronograma | null = null;
  let proximoDiaIndex = -1;

  if (plano) {
    const atividades = plano.cronograma.flatMap((d) => d.atividades);
    totalHoras = atividades.reduce((acc, a) => acc + a.duracao_horas, 0);
    horasConcluidas = atividades.reduce(
      (acc, a) => acc + (a.concluida ? a.duracao_horas : 0),
      0
    );
    progressoPorcentagem = totalHoras > 0 ? Math.round((horasConcluidas / totalHoras) * 100) : 0;

    // Find the first day that has at least one uncompleted activity
    proximoDiaIndex = plano.cronograma.findIndex((dia) =>
      dia.atividades.some((a) => !a.concluida)
    );
    // If all are completed, show the last day
    if (proximoDiaIndex === -1 && plano.cronograma.length > 0) {
      proximoDiaIndex = plano.cronograma.length - 1;
    }
    if (proximoDiaIndex !== -1) {
      proximoDiaFoco = plano.cronograma[proximoDiaIndex];
    }
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden pb-16">
      {/* Decorative background grid */}
      <div className="fixed inset-0 grid-lines pointer-events-none opacity-60" aria-hidden />

      {/* ========== NAV ========== */}
      <nav className="relative z-20">
        <div className="container flex items-center justify-between py-5 md:py-6">
          <div className="flex items-center gap-2.5">
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

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-glow pointer-events-none" />

        <div className="container relative pt-8 sm:pt-12 md:pt-16 pb-12">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left — copy */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mb-6 md:mb-8 animate-fade-up">
                <Sparkles className="h-3 w-3 text-accent" />
                Cronograma com IA · Gemini 2.5
              </div>

              <h1 className="animate-fade-up delay-100 text-balance font-display font-semibold tracking-tight text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl lg:text-[5.5rem] lg:leading-[0.95] mb-6 md:mb-8">
                Estude{" "}
                <span className="serif-italic glow-text font-normal">menos</span>,
                <br className="hidden sm:block" />
                {" "}retenha{" "}
                <span className="serif-italic glow-text font-normal">muito mais</span>.
              </h1>

              <p className="animate-fade-up delay-200 text-pretty text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 md:mb-10">
                Um plano de estudos inteligente que pensa por você. Distribuição inteligente, revisões espaçadas e foco cirúrgico —
                desenhado para chegar à sua prova com a cabeça leve.
              </p>

              <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                {plano ? (
                  <Button
                    onClick={() => navigate("/cronograma")}
                    size="lg"
                    className="w-full sm:w-auto h-12 px-6 text-sm font-semibold bg-gradient-hero hover:opacity-95 shadow-glow group"
                  >
                    Ver meu cronograma ativo
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/criar")}
                    size="lg"
                    className="w-full sm:w-auto h-12 px-6 text-sm font-semibold bg-gradient-hero hover:opacity-95 shadow-glow group"
                  >
                    Criar meu cronograma
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                )}
                <div className="text-sm text-muted-foreground">
                  Crie seu Cronograma em questão de segundos!
                </div>
              </div>
            </div>

            {/* Right — visual mock */}
            <div className="lg:col-span-5 relative animate-fade-up delay-300">
              <div className="relative">
                {/* Floating decorative card */}
                <div className="absolute -top-6 -right-2 sm:-right-6 z-10 hidden sm:block animate-float">
                  <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 shadow-glow">
                    <div className="h-8 w-8 rounded-lg bg-success/15 grid place-items-center">
                      <Brain className="h-4 w-4 text-success" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Retenção</div>
                      <div className="font-display text-sm font-semibold">+87%</div>
                    </div>
                  </div>
                </div>

                {/* Main card */}
                <div className="glass-card rounded-3xl p-5 sm:p-6 noise relative overflow-hidden">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Hoje · Quarta
                      </div>
                      <div className="font-display text-xl font-semibold">3h focadas</div>
                    </div>
                    <div className="chip">
                      <Zap className="h-3 w-3" /> Sprint
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: "Cinemática", time: "1h", type: "estudo", color: "bg-primary/15 text-primary-foreground", icon: BookOpen },
                      { name: "Termodinâmica", time: "45m", type: "revisão", color: "bg-accent/15 text-accent", icon: RotateCcw },
                      { name: "Eletromagnetismo", time: "1h15", type: "estudo", color: "bg-primary/15 text-primary-foreground", icon: BookOpen },
                    ].map((it, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/50"
                      >
                        <div className={cn("h-8 w-8 rounded-lg grid place-items-center flex-shrink-0", it.color)}>
                          <it.icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{it.name}</div>
                          <div className="text-[11px] text-muted-foreground capitalize">{it.type}</div>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">{it.time}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progresso da semana</span>
                    <span className="font-semibold">14h / 21h</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full w-[66%] rounded-full bg-gradient-hero animate-shimmer"
                      style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))" }} />
                  </div>
                </div>

                {/* Floating decorative card 2 */}
                <div className="absolute -bottom-4 -left-2 sm:-left-6 z-10 hidden sm:block animate-float" style={{ animationDelay: "1.5s" }}>
                  <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent/15 grid place-items-center">
                      <RotateCcw className="h-4 w-4 text-accent" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Revisões</div>
                      <div className="font-display text-sm font-semibold">1 · 3 · 7 dias</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto animate-fade-up delay-500">
            {[
              { v: "10s", l: "Para gerar" },
              { v: "1·3·7", l: "Revisões espaçadas" },
              { v: "∞", l: "Conteúdos" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl md:text-5xl font-semibold tracking-tight glow-text">{s.v}</div>
                <div className="mt-1 text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION DYNAMIC DASHBOARD OR CTA ========== */}
      <section className="container py-12 max-w-5xl">
        {plano ? (
          <>
          <div className="glass-card rounded-3xl p-6 md:p-10 noise relative overflow-hidden animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  Cronograma em andamento
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                  Seu Painel de Estudos
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => navigate("/cronograma")}
                  className="bg-gradient-hero text-sm font-semibold hover:opacity-95 shadow-glow"
                >
                  Abrir Cronograma Completo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/criar")}
                  className="text-xs border-border bg-transparent hover:bg-secondary/40"
                >
                  Criar Novo
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              {/* Progresso Geral */}
              <div className="space-y-4">
                <h3 className="font-display text-base font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Progresso do Sprint
                </h3>
                <div className="bg-secondary/20 border border-border/40 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display text-3xl font-bold glow-text">{progressoPorcentagem}%</span>
                    <span className="text-xs text-muted-foreground">{horasConcluidas}h / {totalHoras}h</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-hero"
                      style={{
                        width: `${progressoPorcentagem}%`,
                        backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))"
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Marque as atividades concluídas para subir o seu rendimento.
                  </p>
                </div>
              </div>

              {/* Foco de Hoje / Próximo Dia */}
              {proximoDiaFoco && (
                <div className="md:col-span-2 space-y-4">
                  <h3 className="font-display text-base font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                    Foco Atual — Dia {proximoDiaIndex + 1} ({format(new Date(proximoDiaFoco.data + "T00:00:00"), "dd/MM", { locale: ptBR })})
                  </h3>
                  <div className="bg-secondary/20 border border-border/40 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-accent" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {format(new Date(proximoDiaFoco.data + "T00:00:00"), "EEEE", { locale: ptBR })}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 border-primary/25 text-xs text-foreground">
                        {proximoDiaFoco.total_horas}h planejadas
                      </Badge>
                    </div>

                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {proximoDiaFoco.atividades.map((a, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-background/30 text-xs",
                            a.concluida && "opacity-55"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {a.concluida ? (
                              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0 animate-pulse" />
                            )}
                            <div className="truncate font-medium text-foreground/90">{a.conteudo}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-muted-foreground capitalize text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded">
                              {a.tipo}
                            </span>
                            <span className="font-semibold">{a.duracao_horas}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <PlanoHistoryPicker
            entries={historico}
            activeId={activeId}
            onSelect={handleSelectPlano}
            className="mt-6 glass-card rounded-3xl p-6 md:p-8 noise"
          />
          </>
        ) : (
          /* EMPTY STATE / LANDING CTA */
          <div className="glass-card rounded-3xl p-8 md:p-12 noise text-center space-y-6 max-w-3xl mx-auto animate-fade-up">
            <div className="h-12 w-12 rounded-2xl bg-gradient-hero grid place-items-center shadow-glow mx-auto mb-2">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
              Pronto para criar seu primeiro cronograma?
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Diga-nos o que você precisa estudar e a data da sua prova. Nossa Inteligência Artificial vai dividir as matérias de forma otimizada para você.
            </p>
            <Button
              onClick={() => navigate("/criar")}
              size="lg"
              className="bg-gradient-hero hover:opacity-95 shadow-glow font-semibold"
            >
              Criar meu cronograma agora
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="container border-t border-border py-8 mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-hero grid place-items-center">
              <GraduationCap className="h-3 w-3 text-primary-foreground" />
            </div>
            <span>StudySprint © {new Date().getFullYear()}</span>
          </div>
          <span className="serif-italic text-sm">Estude com intenção, não com pressa.</span>
        </div>
      </footer>
    </main>
  );
};

export default Index;
