import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Conta criada! Bora estudar 🚀");
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message ?? "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="fixed inset-0 grid-lines pointer-events-none opacity-60" aria-hidden />
      {/* Glow */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-glow pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-12 w-12 rounded-2xl bg-gradient-hero grid place-items-center shadow-glow mb-4">
            <GraduationCap className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
          </div>
          <div className="font-display text-2xl font-semibold tracking-tight">StudySprint</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Study, smarter
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 noise relative overflow-hidden">
          <h1 className="font-display text-2xl font-semibold tracking-tight mb-1">
            Criar conta
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-accent hover:underline underline-offset-2 transition-colors"
            >
              Entrar
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Nome
              </Label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-input/50 border-border"
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                E-mail
              </Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-input/50 border-border"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Senha{" "}
                <span className="text-muted-foreground/60 normal-case tracking-normal">
                  (mín. 6 caracteres)
                </span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-input/50 border-border pr-11"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full h-12 font-semibold bg-gradient-hero hover:opacity-95 shadow-glow group mt-2"
            >
              {loading ? (
                "Criando conta..."
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar conta grátis
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Seus dados ficam apenas neste navegador.
        </p>
      </div>
    </main>
  );
};

export default Register;