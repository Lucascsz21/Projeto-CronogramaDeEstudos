import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon, Plus, Sparkles, Trash2, ArrowRight, ArrowLeft,
  GraduationCap, Target, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addPlano } from "@/lib/planoStorage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Conteudo { id: string; nome: string; dificuldade: number; }
interface Atividade { conteudo: string; subtopico?: string; tipo: "estudo" | "revisão"; duracao_horas: number; dificuldade: number; concluida?: boolean; }
interface DiaCronograma { data: string; total_horas: number; atividades: Atividade[]; }
interface Trilha { materia: string; subtopicos: string[]; }
interface Plano { resumo_geral: string; trilhas?: Trilha[]; cronograma: DiaCronograma[]; dicas: string[]; }

const CriarCronograma = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [dataProva, setDataProva] = useState<Date | undefined>();
  const [tempoDiario, setTempoDiario] = useState<string>("3");
  const [conteudos, setConteudos] = useState<Conteudo[]>([
    { id: crypto.randomUUID(), nome: "", dificuldade: 3 },
  ]);
  const [loading, setLoading] = useState(false);

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
    try {
      const { data, error } = await supabase.functions.invoke("generate-study-plan", {
        body: {
          data_prova: format(dataProva, "yyyy-MM-dd"),
          data_atual: format(new Date(), "yyyy-MM-dd"),
          tempo_diario: Number(tempoDiario) || 3,
          preferencia: "qualquer",
          conteudos: validos.map((c) => ({ nome: c.nome.trim(), dificuldade: c.dificuldade })),
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      
      const planoData = data as Plano;
      // Pre-initialize concluida state if needed
      planoData.cronograma = planoData.cronograma.map(dia => ({
        ...dia,
        atividades: dia.atividades.map(ativ => ({
          ...ativ,
          concluida: false
        }))
      }));

      if (!user?.id) throw new Error("Usuário não autenticado.");
      addPlano(user.id, planoData);
      
      toast.success("Cronograma gerado com sucesso!");
      navigate("/cronograma");
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

      {/* ========== FORM ========== */}
      <section className="container py-8 md:py-12 max-w-4xl animate-fade-up">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar ao Início
          </Button>
        </div>

        <div className="text-center mb-8 md:mb-10">
          <div className="chip mb-4">
            <Target className="h-3 w-3" /> Configuração do Cronograma
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            Planeje seu sprint com a{" "}
            <span className="serif-italic glow-text font-normal">nossa inteligência artificial</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-sm max-w-lg mx-auto">
            Preencha os dados da sua prova e os conteúdos que precisa dominar. Nossa IA vai criar um plano balanceado com revisões e teoria.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-5 sm:p-8 md:p-10 space-y-8 md:space-y-10 noise relative overflow-hidden">
          {/* row 1 */}
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
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
                    {dataProva ? format(dataProva, "dd 'de' MMM, yyyy", { locale: ptBR }) : "Escolha a data"}
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
                <Clock className="h-3.5 w-3.5 text-accent" /> Horas de estudo por dia
              </Label>
              <Input
                type="number"
                min="1"
                max="24"
                value={tempoDiario}
                onChange={(e) => setTempoDiario(e.target.value)}
                placeholder="Ex: 3"
                className="h-12 bg-input/50 border-border text-base"
              />
            </div>
          </div>

          {/* divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Matérias / Conteúdos</span>
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
                      Carga de Estudo
                    </span>
                    <Select
                      value={c.dificuldade.toString()}
                      onValueChange={(v) => updateConteudo(c.id, { dificuldade: parseInt(v) })}
                    >
                      <SelectTrigger className="h-10 w-full bg-background/50 border-border/60 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Carga Baixa</SelectItem>
                        <SelectItem value="2">Carga Baixa/Média</SelectItem>
                        <SelectItem value="3">Carga Média</SelectItem>
                        <SelectItem value="4">Carga Média/Alta</SelectItem>
                        <SelectItem value="5">Carga Alta</SelectItem>
                      </SelectContent>
                    </Select>
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
                <Sparkles className="h-5 w-5 mr-2" /> Gerar meu cronograma com IA
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default CriarCronograma;
