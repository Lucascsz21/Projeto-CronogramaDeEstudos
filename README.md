# StudySprint 🎯

> Seu plano de estudos inteligente, personalizado e otimizado com IA para máxima retenção até o dia da prova.

🌐 **Acesse a versão ao vivo:** [studysprintplanner.netlify.app](https://studysprintplanner.netlify.app)

---

## 📖 Sobre o projeto

**StudySprint** é uma aplicação web que utiliza Inteligência Artificial para gerar cronogramas de estudos altamente eficientes e personalizados. A ideia nasceu da dificuldade que muitos estudantes têm em organizar o tempo até uma prova importante: vestibular, concurso, ENEM, faculdade ou certificações.

Em vez de gastar horas tentando montar um plano manual (e geralmente abandoná-lo na primeira semana), basta informar:

- 📅 A **data da prova**
- ⏱️ Quantas **horas por dia** você consegue estudar
- 📚 Os **conteúdos** que precisa dominar (com nível de dificuldade individual)
- 🌅 Sua **preferência de horário** (manhã, tarde ou noite)

A IA monta automaticamente um cronograma completo, dia a dia, com revisões espaçadas, decomposição de cada matéria em sub-tópicos progressivos e dicas personalizadas de estudo.

---

## 🎯 Pra que serve?

- 🎓 **Vestibulandos e concurseiros** que precisam organizar muitos conteúdos em pouco tempo.
- 📚 **Estudantes universitários** se preparando para provas finais.
- 💼 **Profissionais** estudando para certificações técnicas.
- 🧠 **Qualquer pessoa** que queira aprender algo novo de forma estruturada e eficiente.

O diferencial do StudySprint é a **progressão didática real** dentro de cada matéria: você não estuda tópicos avançados antes dos fundamentais, e a IA garante que cada conteúdo seja revisado nos intervalos ideais para fixação na memória de longo prazo.

---

## ✨ Funcionalidades

- 🔑 **Autenticação de Usuário** — Cadastro e Login protegidos (via Supabase) para salvar e gerenciar seus cronogramas com segurança.
- 📅 **Cronograma diário detalhado** até a data da prova.
- 📜 **Histórico de Cronogramas** — Crie e gerencie até 2 cronogramas de estudo ativos simultaneamente, alternando entre eles a qualquer momento pelo painel.
- 📈 **Checklist de Progresso** — Marque atividades como concluídas diretamente no cronograma para atualizar o progresso geral e tempo estudado em tempo real.
- ⏱️ **Duração e Tempo por Tarefa** — O cronograma calcula e distribui o tempo específico dedicado para cada sessão de estudo ou revisão.
- 🧩 **Decomposição em sub-tópicos progressivos** — Cada matéria é dividida em uma trilha didática (do básico ao avançado).
- 🧠 **Revisões espaçadas inteligentes** (1, 3 e 7 dias após o estudo inicial).
- 🎚️ **Priorização por dificuldade** — Conteúdos marcados como mais difíceis recebem prioridade e mais sessões de estudo.
- 🌅 **Respeito ao limite diário** de horas e preferências de horário (manhã / tarde / noite).
- 🍅 **Sugestões com técnica Pomodoro** nas dicas personalizadas de estudo.
- 🎨 **Visual Midnight Indigo** com efeitos glassmorphism, otimizado para sessões longas de estudo sem cansaço visual.

---

## 🛠️ Stack Técnica

### Frontend
- **[React 18](https://react.dev/)** — Biblioteca de UI
- **[Vite 5](https://vitejs.dev/)** — Tooling e build de alta performance (rodando na porta `8080`)
- **[TypeScript 5](https://www.typescriptlang.org/)** — Tipagem estática
- **[React Router DOM v6](https://reactrouter.com/)** — Navegação e rotas protegidas
- **[Tailwind CSS v3](https://tailwindcss.com/)** — Estilização utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** — Componentes acessíveis e customizáveis
- **[date-fns](https://date-fns.org/)** — Manipulação de datas formatadas (locale pt-BR)
- **Fontes:** Space Grotesk (display) + Inter (body)

### Backend & Banco de Dados
- **[Supabase](https://supabase.com/)** — Autenticação de usuários, sessão segura e integração com tabelas.
- **[TypeScript](https://www.typescriptlang.org/)** — Linguagem do código serverless.
- **[Deno](https://deno.com/)** — Runtime seguro para as Edge Functions do Supabase.

### Hospedagem
- **[Netlify](https://www.netlify.com/)** — Hospedagem do frontend (build automático via GitHub).
- **Lovable Cloud** — Edge functions integradas para IA (deploy automático).

---

## 🚀 Como usar

1. Crie uma conta ou faça login na aplicação.
2. No painel inicial, clique em **"Criar meu cronograma"** (se não tiver nenhum ativo).
3. Escolha a **data da prova** no calendário.
4. Defina o formato e a quantidade de **horas por dia** que você pode estudar.
5. Escolha sua **preferência de horário**.
6. Adicione os **conteúdos** e defina o nível de dificuldade (1 a 5).
7. Clique em **"Gerar cronograma com IA"** ✨.
8. Acompanhe seu plano no painel de controle: marque as tarefas feitas e veja seu progresso subir!

---

## 💻 Rodando localmente

```bash
# Clone o repositório
git clone <url-do-repo>
cd studysprint

# Instale as dependências
npm install
# ou se preferir usar Bun:
bun install

# Configure as variáveis de ambiente (.env)
VITE_SUPABASE_URL=sua-url
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave

# Rode o servidor em modo de desenvolvimento
npm run dev
# ou
bun run dev
```

A aplicação ficará disponível por padrão em `http://localhost:8080`.

---

## 📦 Estrutura do projeto

```
studysprint/
├── public/
│   └── _redirects              # SPA fallback para Netlify
├── src/
├── public/
│   └── _redirects
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── NavLink.tsx
│   │   ├── ProtectedRoute.tsx  # Rota privada baseada em autenticação
│   │   └── PlanoHistoryPicker.tsx # Seletor de histórico de planos
│   ├── contexts/
│   │   └── AuthContext.tsx     # Gerenciamento de login/registro com Supabase
│   ├── hooks/                  # React hooks customizados
│   ├── integrations/supabase/  # Cliente de integração com Supabase
│   ├── lib/
│   │   ├── planoStorage.ts     # Gerenciamento de persistência de planos
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Index.tsx           # Dashboard / Painel do Estudante (progresso geral e histórico)
│   │   ├── CriarCronograma.tsx # Formulário de configuração do cronograma
│   │   ├── Cronograma.tsx      # Calendário diário de estudos, atividades e progresso
│   │   ├── Login.tsx           # Tela de autenticação de usuários
│   │   ├── Register.tsx        # Tela de registro de novos usuários
│   │   └── NotFound.tsx
│   ├── App.tsx                 # Rotas e provedores gerais
│   ├── index.css               # Design system Midnight Indigo
│   └── main.tsx
└── supabase/
    ├── config.toml
    └── functions/
        └── generate-study-plan/  # Edge function que conecta ao modelo Gemini 2.5
```

---

## 🎨 Design System

Tema **Midnight Indigo** — escuro, focado, ideal para sessões de estudo prolongadas.

| Token       | Valor                  |
| ----------- | ---------------------- |
| Background  | `hsl(240 40% 6%)`      |
| Primary     | `hsl(243 75% 59%)`     |
| Accent      | `hsl(250 90% 70%)`     |
| Card        | Glassmorphism c/ blur  |

Todas as cores são baseadas em variáveis HSL semânticas definidas em `src/index.css` e `tailwind.config.ts`, permitindo consistência visual em todos os componentes.

---

## 🤖 Como a IA monta o cronograma

A edge function `generate-study-plan` envia um prompt estruturado para o **Gemini** com regras pedagógicas bem definidas:

1. **Decomposição:** Divide cada matéria em uma trilha progressiva de 4 a 10 sub-tópicos (do introdutório ao avançado).
2. **Distribuição:** Aloca as horas diárias respeitando a proximidade da prova e o nível de dificuldade do assunto.
3. **Progressão didática:** Garante que sub-tópicos fundamentais sejam agendados antes dos avançados.
4. **Revisões:** Aplica a curva de esquecimento (revisões em 1, 3 e 7 dias) para fixação na memória.
5. **Duração:** Estipula e balanceia as horas dedicadas a cada tarefa de estudo ou revisão.
6. **Intercalação:** Intercala matérias diferentes ao longo do dia para manter a mente ativa e evitar fadiga.
7. **Pomodoro:** Sugere intervalos focados de estudo e pequenas pausas.

---

## 🤝 Contribuindo

Contribuições são super bem-vindas! Fique à vontade para abrir issues ou submeter pull requests com novos recursos, correções de bugs ou melhorias de design.

---

## 📝 Licença

Projeto para fins educacionais e de estudo pessoal. Sinta-se livre para customizar e criar o seu próprio planejador!

---

**StudySprint** © — estudo inteligente, sem sobrecarga. 🚀
