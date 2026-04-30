# StudySprint 🎯

> Seu plano de estudos inteligente, personalizado e otimizado com IA para máxima retenção até o dia da prova.

🌐 **Acesse a versão ao vivo:** [studysprintplanner.netlify.app](https://studysprintplanner.netlify.app)

---

## 📖 Sobre o projeto

**StudySprint** é uma aplicação web que utiliza Inteligência Artificial para gerar cronogramas de estudos altamente eficientes e personalizados. A ideia nasceu da dificuldade que muitos estudantes têm em organizar o tempo até uma prova importante: vestibular, concurso, ENEM, faculdade ou certificações.

Em vez de você gastar horas tentando montar um plano (e geralmente abandonar na primeira semana), basta informar:

- 📅 A **data da prova**
- ⏱️ Quantas **horas por dia** você consegue estudar
- 📚 Os **conteúdos** que precisa dominar (com nível de dificuldade)
- 🌅 Sua **preferência de horário** (manhã, tarde ou noite)

A IA monta automaticamente um cronograma completo, dia a dia, com revisões espaçadas, decomposição de cada matéria em sub-tópicos progressivos e dicas personalizadas de estudo.

---

## 🎯 Pra que serve?

- 🎓 **Vestibulandos e concurseiros** que precisam organizar muitos conteúdos em pouco tempo
- 📚 **Estudantes universitários** se preparando para provas finais
- 💼 **Profissionais** estudando para certificações técnicas
- 🧠 **Qualquer pessoa** que queira aprender algo novo de forma estruturada e eficiente

O diferencial do StudySprint é a **progressão didática real** dentro de cada matéria, você não estuda tópicos avançados antes dos fundamentais, e a IA garante que cada conteúdo seja revisado nos intervalos ideais para fixação na memória de longo prazo.

---

## ✨ Funcionalidades

- 📅 **Cronograma diário detalhado** até a data da prova
- 🧩 **Decomposição em sub-tópicos progressivos** — cada matéria é dividida em uma trilha didática (do básico ao avançado)
- 🧠 **Revisões espaçadas inteligentes** (1, 3 e 7 dias após o estudo inicial)
- 🎚️ **Priorização por dificuldade** — conteúdos mais difíceis ganham mais sessões
- ⏱️ **Respeita seu limite diário** de horas
- 🌙 **Preferência de horário** (manhã / tarde / noite)
- 🍅 **Sugestões com técnica Pomodoro** (25min foco / 5min pausa)
- 💡 **Dicas personalizadas** geradas pela IA
- 🎨 **Visual Midnight Indigo** com efeitos glassmorphism, otimizado para sessões longas de estudo

---

## 🛠️ Stack Técnica

### Frontend
- **[React 18](https://react.dev/)** — biblioteca de UI
- **[Vite 5](https://vitejs.dev/)** — build tool ultra-rápido
- **[TypeScript 5](https://www.typescriptlang.org/)** — tipagem estática
- **[Tailwind CSS v3](https://tailwindcss.com/)** — utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** — componentes acessíveis e customizáveis
- **[date-fns](https://date-fns.org/)** — manipulação de datas (locale pt-BR)
- **Fontes:** Space Grotesk (display) + Inter (body)

### Backend
- **[TypeScript](https://www.typescriptlang.org/)** — linguagem do código serverless
- **[Deno](https://deno.com/)** — runtime moderno e seguro para JavaScript/TypeScript (usado pelas Edge Functions)

### Hospedagem
- **[Netlify](https://www.netlify.com/)** — frontend (build automático via GitHub)
- **Lovable Cloud** — edge functions (deploy automático)

---

## 🚀 Como usar

1. Acesse [studysprintplanner.netlify.app](https://studysprintplanner.netlify.app)
2. Escolha a **data da prova** no calendário
3. Defina quantas **horas por dia** você pode estudar (1 a 12h)
4. Escolha sua **preferência de horário**
5. Adicione os **conteúdos** com nível de dificuldade (1 a 5)
6. Clique em **"Gerar cronograma com IA"** ✨
7. Receba seu plano completo: resumo, trilhas por matéria, cronograma diário e dicas

---

## 💻 Rodando localmente

```bash
# Clone o repositório
git clone <url-do-repo>
cd studysprint

# Instale as dependências
npm install

# Configure as variáveis de ambiente (.env)
VITE_SUPABASE_URL=sua-url
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave
VITE_SUPABASE_PROJECT_ID=seu-id

# Rode em modo de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:8080`.

---

## 📦 Estrutura do projeto

```
studysprint/
├── public/
│   └── _redirects              # SPA fallback para Netlify
├── src/
│   ├── pages/
│   │   ├── Index.tsx           # Página principal (formulário + cronograma)
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   └── NavLink.tsx
│   ├── integrations/supabase/  # Cliente Lovable Cloud (auto-gerado)
│   ├── hooks/                  # React hooks customizados
│   ├── lib/                    # Utilitários
│   └── index.css               # Design system Midnight Indigo
└── supabase/
    ├── config.toml
    └── functions/
        └── generate-study-plan/  # Edge function que chama o AI Gateway
```

---

## 🎨 Design System

Tema **Midnight Indigo** — escuro, focado, ideal para sessões de estudo noturnas.

| Token       | Valor                  |
| ----------- | ---------------------- |
| Background  | `hsl(240 40% 6%)`      |
| Primary     | `hsl(243 75% 59%)`     |
| Accent      | `hsl(250 90% 70%)`     |
| Card        | Glassmorphism c/ blur  |

Todas as cores são tokens HSL semânticos definidos em `src/index.css` e `tailwind.config.ts`, garantindo consistência visual e fácil manutenção.

---

## 🤖 Como a IA monta o cronograma

A edge function `generate-study-plan` envia um prompt estruturado para o **Gemini 2.5 Flash** com regras rígidas:

1. **Decomposição:** Para cada matéria, gera uma trilha de 4 a 10 sub-tópicos, do introdutório ao avançado
2. **Distribuição:** Divide o período até a prova respeitando dificuldade e proximidade
3. **Progressão:** Garante que sub-tópicos sejam estudados na ordem didática correta
4. **Revisões:** Aplica espaçamento (1, 3 e 7 dias) para fixação na memória de longo prazo
5. **Mistura:** Combina matérias diferentes no mesmo dia (evita monotonia)
6. **Pomodoro:** Sugere pausas e técnica 25/5 nas dicas
7. **Output:** Retorna **JSON estrito** com `resumo_geral`, `trilhas[]`, `cronograma[]` e `dicas[]`

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests com melhorias, correções ou novas funcionalidades.

---

## 📝 Licença

Projeto pessoal — sinta-se à vontade para usar como base para seus próprios estudos ou projetos.

---

**StudySprint** © — estudo inteligente, sem sobrecarga. 🚀
