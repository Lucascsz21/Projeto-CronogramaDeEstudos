import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon, Plus, Sparkles, Trash2, BookOpen, Clock, Lightbulb,
  RotateCcw, ArrowRight, Brain, Zap, Target, GraduationCap, ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Conteudo { id: string; nome: string; dificuldade: number; }
interface Atividade { conteudo: string; subtopico?: string; tipo: "estudo" | "revisão"; duracao_horas: number; dificuldade: number; }
interface DiaCronograma { data: string; total_horas: number; atividades: Atividade[]; }
interface Trilha { materia: string; subtopicos: string[]; }
interface Plano { resumo_geral: string; trilhas?: Trilha[]; cronograma: DiaCronograma[]; dicas: string[]; }

const dificuldadeColor = (n: number) => {
  if (n <= 2) return "bg-success/10 text-success border-success/25";
  if (n === 3) return "bg-warning/10 text-warning border-warning/25";
  return "bg-destructive/10 text-destructive border-destructive/25";
};

const Index = () => {
  const [dataProva, setDataProva] = useState<Date | undefined>();
  const [tempoDiario, setTempoDiario] = useState<number[]>([3]);
  const [preferencia, setPreferencia] = useState<string>("noite");
  const [conteudos, setConteudos] = useState<Conteudo[]>([
    { id: crypto.randomUUID(), nome: "", dificuldade: 3 },
  ]);
  const [loading, setLoading] = useState(false);
  const [plano, setPlano] = useState<Plano | null>(null);

  const addConteudo = () =>
    setConteudos((p) => [...p, { id: crypto.randomUUID(), nome: "", dificuldade: 3 }]);
  const removeConteudo = (id: string) =>
    setConteudos((p) => (p.length > 1 ? p.filter((c) => c.id !== id) : p));
  const updateConteudo = (id: string, patch: Partial<Conteudo>) =>
    setConteudos((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const diasRestantes = dataProva ? Math.max(0, differenceInDays(dataProva, new Date()) + 1) : 0;

  const handleGerar = async () => {
    if (!dataProva) return toast.error("Escolha a data da prova");
    const validos = conteudos.filter((c) => c.nome.trim().length > 0);
    if (validos.length === 0) return toast.error("Adicione ao menos um conteúdo");

    setLoading(true);
    setPlano(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-study-plan", {
        body: {
          data_prova: format(dataProva, "yyyy-MM-dd"),
          data_atual: format(new Date(), "yyyy-MM-dd"),
          tempo_diario: tempoDiario[0],
          preferencia,
          conteudos: validos.map((c) => ({ nome: c.nome.trim(), dificuldade: c.dificuldade })),
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setPlano(data as Plano);
      toast.success("Cronograma gerado!");
      setTimeout(() => {
        document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) {
      toast.error((e as Error).message ?? "Erro ao gerar cronograma");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden">
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
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            IA online
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-glow pointer-events-none" />

        <div className="container relative pt-8 sm:pt-12 md:pt-20 pb-16 md:pb-24">
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
                Um plano de estudos que pensa por você. Distribuição inteligente, revisões espaçadas e foco cirúrgico —
                desenhado para chegar à sua prova com a cabeça leve.
              </p>

              <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  className="w-full sm:w-auto h-12 px-6 text-sm font-semibold bg-gradient-hero hover:opacity-95 shadow-glow group"
                >
                  Criar meu cronograma
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <div className="text-xs text-muted-foreground">
                  Grátis · Sem cadastro · ~10 segundos
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
          <div className="mt-16 md:mt-24 grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto animate-fade-up delay-500">
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

      {/* ========== FORM ========== */}
      <section id="formulario" className="container py-16 md:py-24 max-w-5xl scroll-mt-8">
        <div className="text-center mb-10 md:mb-14 animate-fade-up">
          <div className="chip mb-4">
            <Target className="h-3 w-3" /> Configure seu sprint
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            Conte para a IA{" "}
            <span className="serif-italic glow-text font-normal">o que você precisa estudar</span>
          </h2>
        </div>

        <div className="glass-card rounded-3xl p-5 sm:p-8 md:p-10 space-y-8 md:space-y-10 noise relative overflow-hidden animate-fade-up delay-100">
          {/* row 1 */}
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            <div className="space-y-2.5">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                <CalendarIcon className="h-3.5 w-3.5 text-accent" /> Data da prova
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 bg-input/50 border-border hover:bg-input/80",
                      !dataProva && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataProva ? format(dataProva, "dd 'de' MMM, yyyy", { locale: ptBR }) : "Escolha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataProva}
                    onSelect={setDataProva}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {diasRestantes > 0 && (
                <div className="text-[11px] text-accent font-medium animate-fade-in">
                  {diasRestantes} {diasRestantes === 1 ? "dia restante" : "dias restantes"}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                <Clock className="h-3.5 w-3.5 text-accent" /> Horas por dia
                <span className="ml-auto text-foreground font-display text-base normal-case tracking-normal">
                  {tempoDiario[0]}h
                </span>
              </Label>
              <div className="h-12 flex items-center px-1 rounded-md bg-input/40 border border-border">
                <Slider value={tempoDiario} onValueChange={setTempoDiario} min={1} max={12} step={0.5} />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Melhor horário
              </Label>
              <Select value={preferencia} onValueChange={setPreferencia}>
                <SelectTrigger className="h-12 bg-input/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manhã">🌅 Manhã</SelectItem>
                  <SelectItem value="tarde">☀️ Tarde</SelectItem>
                  <SelectItem value="noite">🌙 Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Conteúdos</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* conteudos */}
          <div className="space-y-4">
            <div className="space-y-3">
              {conteudos.map((c, i) => (
                <div
                  key={c.id}
                  className="group grid grid-cols-12 gap-3 items-center p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border hover:border-primary/40 transition-colors"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-primary/15 grid place-items-center text-primary-foreground font-display text-xs font-semibold flex-shrink-0">
                        {i + 1}
                      </div>
                      <Input
                        placeholder="Ex: Cinemática, Verbos irregulares..."
                        value={c.nome}
                        maxLength={120}
                        onChange={(e) => updateConteudo(c.id, { nome: e.target.value })}
                        className="bg-background/50 border-border/60 h-10"
                      />
                    </div>
                  </div>
                  <div className="col-span-10 sm:col-span-6 flex items-center gap-3 sm:pl-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap hidden sm:inline">
                      Dificuldade
                    </span>
                    <Slider
                      value={[c.dificuldade]}
                      onValueChange={(v) => updateConteudo(c.id, { dificuldade: v[0] })}
                      min={1} max={5} step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className={cn("min-w-9 justify-center font-display", dificuldadeColor(c.dificuldade))}>
                      {c.dificuldade}
                    </Badge>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeConteudo(c.id)}
                      disabled={conteudos.length === 1}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addConteudo}
              className="w-full h-11 border-dashed border-border hover:border-accent hover:text-accent hover:bg-accent/5"
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar conteúdo
            </Button>
          </div>

          <Button
            onClick={handleGerar}
            disabled={loading}
            size="lg"
            className="w-full h-14 text-base font-semibold bg-gradient-hero hover:opacity-95 shadow-glow group"
          >
            {loading ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-pulse" /> Pensando no seu plano...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" /> Gerar cronograma com IA
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        </div>

        {/* Resultado */}
        {plano && (
          <div id="resultado" className="mt-16 md:mt-20 space-y-10 md:space-y-12 animate-fade-up scroll-mt-8">
            <div className="text-center">
              <div className="chip mb-4"><Sparkles className="h-3 w-3" /> Seu plano</div>
              <h3 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                Pronto. Agora é só{" "}
                <span className="serif-italic glow-text font-normal">executar</span>.
              </h3>
            </div>

            <div className="glass-card rounded-3xl p-6 md:p-10 noise relative">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent font-medium mb-4">
                <Sparkles className="h-3 w-3" /> Resumo
              </div>
              <p className="serif text-xl md:text-3xl leading-snug text-pretty text-foreground/95">
                {plano.resumo_geral}
              </p>
            </div>

            {plano.trilhas && plano.trilhas.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-6">
                  <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2.5">
                    <ListOrdered className="h-5 w-5 text-accent" /> Trilhas de aprendizado
                  </h3>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Ordem progressiva por matéria
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

            <div>
              <div className="flex items-end justify-between mb-6">
                <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2.5">
                  <CalendarIcon className="h-5 w-5 text-accent" /> Cronograma
                </h3>
                <span className="text-xs text-muted-foreground">{plano.cronograma.length} dias</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5">
                {plano.cronograma.map((dia, idx) => (
                  <div
                    key={idx}
                    className="glass-card rounded-2xl p-5 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 group animate-fade-up"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                          {format(new Date(dia.data + "T00:00:00"), "EEEE", { locale: ptBR })}
                        </div>
                        <div className="font-display text-xl font-semibold mt-0.5">
                          {format(new Date(dia.data + "T00:00:00"), "dd 'de' MMM", { locale: ptBR })}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 border-primary/30 text-foreground font-display">
                        <Clock className="h-3 w-3 mr-1" /> {dia.total_horas}h
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {dia.atividades.map((a, ai) => (
                        <li
                          key={ai}
                          className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/40 hover:border-border transition-colors"
                        >
                          <div className={cn(
                            "mt-0.5 h-8 w-8 rounded-lg grid place-items-center flex-shrink-0",
                            a.tipo === "revisão" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary-foreground"
                          )}>
                            {a.tipo === "revisão" ? <RotateCcw className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{a.conteudo}</div>
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
                                N{a.dificuldade}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {plano.dicas?.length > 0 && (
              <div className="glass-card rounded-3xl p-6 md:p-10 noise relative">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-warning font-medium mb-5">
                  <Lightbulb className="h-3.5 w-3.5" /> Dicas para você
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
          </div>
        )}
      </section>

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
