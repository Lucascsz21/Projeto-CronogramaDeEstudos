import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Sparkles, Trash2, BookOpen, Clock, Target, Lightbulb, RotateCcw } from "lucide-react";
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

interface Conteudo {
  id: string;
  nome: string;
  dificuldade: number;
}

interface Atividade {
  conteudo: string;
  tipo: "estudo" | "revisão";
  duracao_horas: number;
  dificuldade: number;
}

interface DiaCronograma {
  data: string;
  total_horas: number;
  atividades: Atividade[];
}

interface Plano {
  resumo_geral: string;
  cronograma: DiaCronograma[];
  dicas: string[];
}

const dificuldadeColor = (n: number) => {
  if (n <= 2) return "bg-success/15 text-success border-success/30";
  if (n === 3) return "bg-warning/15 text-warning border-warning/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
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
        document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      toast.error((e as Error).message ?? "Erro ao gerar cronograma");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-glow opacity-80 pointer-events-none" />
        <div className="container relative pt-20 pb-14 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Powered by IA — cronograma em segundos
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-5">
            <span className="glow-text">StudySprint</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Seu plano de estudos inteligente, personalizado e otimizado para máxima retenção até o dia da prova.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="container py-12 max-w-4xl">
        <div className="glass-card rounded-2xl p-6 md:p-10 space-y-8 animate-fade-up">
          <header className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-hero grid place-items-center shadow-glow">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold">Configure seu sprint</h2>
              <p className="text-sm text-muted-foreground">Dados básicos e conteúdos para a IA planejar.</p>
            </div>
          </header>

          {/* row 1 */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-accent" /> Data da prova
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !dataProva && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataProva ? format(dataProva, "PPP", { locale: ptBR }) : "Escolha uma data"}
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
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" /> Horas por dia
                <span className="ml-auto text-foreground font-semibold">{tempoDiario[0]}h</span>
              </Label>
              <div className="h-11 flex items-center px-1">
                <Slider
                  value={tempoDiario}
                  onValueChange={setTempoDiario}
                  min={1}
                  max={12}
                  step={0.5}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferência de horário</Label>
              <Select value={preferencia} onValueChange={setPreferencia}>
                <SelectTrigger className="h-11">
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

          {/* conteudos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-accent" /> Conteúdos a estudar
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addConteudo}
                className="text-accent hover:text-accent hover:bg-accent/10"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {conteudos.map((c, i) => (
                <div
                  key={c.id}
                  className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl bg-secondary/40 border border-border"
                >
                  <div className="col-span-12 md:col-span-6">
                    <Input
                      placeholder={`Conteúdo ${i + 1} (ex: Cinemática)`}
                      value={c.nome}
                      maxLength={120}
                      onChange={(e) => updateConteudo(c.id, { nome: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="col-span-10 md:col-span-5 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Dificuldade</span>
                    <Slider
                      value={[c.dificuldade]}
                      onValueChange={(v) => updateConteudo(c.id, { dificuldade: v[0] })}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className={cn("min-w-9 justify-center", dificuldadeColor(c.dificuldade))}>
                      {c.dificuldade}
                    </Badge>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeConteudo(c.id)}
                      disabled={conteudos.length === 1}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGerar}
            disabled={loading}
            size="lg"
            className="w-full h-14 text-base font-semibold bg-gradient-hero hover:opacity-90 shadow-glow transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-pulse" /> Gerando cronograma...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" /> Gerar cronograma com IA
              </>
            )}
          </Button>
        </div>

        {/* Resultado */}
        {plano && (
          <div id="resultado" className="mt-12 space-y-8 animate-fade-up">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2 text-accent text-sm font-medium mb-3">
                <Sparkles className="h-4 w-4" /> Resumo do plano
              </div>
              <p className="text-foreground/90 leading-relaxed">{plano.resumo_geral}</p>
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-accent" /> Cronograma diário
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {plano.cronograma.map((dia, idx) => (
                  <div
                    key={idx}
                    className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                          {format(new Date(dia.data + "T00:00:00"), "EEEE", { locale: ptBR })}
                        </div>
                        <div className="font-display text-lg font-semibold">
                          {format(new Date(dia.data + "T00:00:00"), "dd 'de' MMM", { locale: ptBR })}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary-foreground">
                        <Clock className="h-3 w-3 mr-1" /> {dia.total_horas}h
                      </Badge>
                    </div>
                    <ul className="space-y-2.5">
                      {dia.atividades.map((a, ai) => (
                        <li
                          key={ai}
                          className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/50"
                        >
                          <div
                            className={cn(
                              "mt-0.5 h-7 w-7 rounded-md grid place-items-center flex-shrink-0",
                              a.tipo === "revisão"
                                ? "bg-accent/15 text-accent"
                                : "bg-primary/15 text-primary-foreground"
                            )}
                          >
                            {a.tipo === "revisão" ? (
                              <RotateCcw className="h-3.5 w-3.5" />
                            ) : (
                              <BookOpen className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{a.conteudo}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="capitalize">{a.tipo}</span>
                              <span>•</span>
                              <span>{a.duracao_horas}h</span>
                              <span>•</span>
                              <span className={cn("px-1.5 rounded", dificuldadeColor(a.dificuldade))}>
                                Nível {a.dificuldade}
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
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" /> Dicas para você
                </h3>
                <ul className="space-y-3">
                  {plano.dicas.map((d, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground/90">
                      <span className="text-accent mt-0.5">→</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="container py-10 text-center text-xs text-muted-foreground">
        StudySprint © {new Date().getFullYear()} — estudo inteligente, sem sobrecarga.
      </footer>
    </main>
  );
};

export default Index;
