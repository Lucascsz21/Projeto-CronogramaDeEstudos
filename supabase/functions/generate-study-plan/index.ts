declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConteudoInput {
  nome: string;
  dificuldade: number;
  prioridade?: number;
}

interface RequestBody {
  data_prova: string;
  data_atual: string;
  tempo_diario: number;
  conteudos: ConteudoInput[];
  preferencia?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body.data_prova || !body.data_atual || !body.tempo_diario || !Array.isArray(body.conteudos) || body.conteudos.length === 0) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Você é um assistente especialista em planejamento de estudos chamado StudySprint.
Seu objetivo é criar um cronograma de estudos altamente eficiente e personalizado, com **progressão didática real** dentro de cada matéria.

PASSO 1 — Decomposição em sub-tópicos progressivos:
Para CADA matéria informada pelo usuário (ex: "Limites e Derivadas"), gere uma trilha ordenada de 4 a 10 sub-tópicos, do mais introdutório ao mais avançado, seguindo a ordem didática real da disciplina.
Exemplo para "Limites e Derivadas":
  1. Noção intuitiva de limite
  2. Limites laterais e propriedades
  3. Limites infinitos e no infinito
  4. Continuidade
  5. Derivada pela definição
  6. Regras de derivação (soma, produto, quociente)
  7. Regra da cadeia
  8. Derivadas de funções trigonométricas/exponenciais
  9. Aplicações: máximos, mínimos, otimização

PASSO 2 — Cronograma:
1. Divida o período total até a prova em dias de estudo.
2. **Atribua cada atividade a um sub-tópico específico** (campo "subtopico"), respeitando a ordem progressiva: o usuário só estuda o sub-tópico N depois de ter estudado o N-1.
3. Distribua com base em dificuldade (mais difíceis ganham mais sessões) e proximidade da prova (mais revisões perto do fim).
4. Revisões inteligentes: Revisão 1 (1 dia depois), Revisão 2 (3 dias depois), Revisão 3 (7 dias depois, se houver tempo). Revisões SEMPRE referenciam um sub-tópico já estudado.
5. Respeite o limite de horas diárias.
6. Misture matérias no mesmo dia (não estude só uma), mas mantenha a ordem progressiva DENTRO de cada matéria.
7. Sugira pausas (Pomodoro 25/5) nas dicas.
8. Se houver pouco tempo, foque nos sub-tópicos fundamentais e mais cobrados.
9. Cronograma realista e executável.

Retorne APENAS JSON válido neste formato EXATO:
{
  "resumo_geral": "string descrevendo o plano e a estratégia de progressão",
  "trilhas": [
    {
      "materia": "string (nome exato informado pelo usuário)",
      "subtopicos": ["sub-tópico 1", "sub-tópico 2", "..."]
    }
  ],
  "cronograma": [
    {
      "data": "YYYY-MM-DD",
      "total_horas": number,
      "atividades": [
        {
          "conteudo": "string (nome da matéria)",
          "subtopico": "string (sub-tópico específico daquela sessão)",
          "tipo": "estudo" | "revisão",
          "duracao_horas": number,
          "dificuldade": number
        }
      ]
    }
  ],
  "dicas": ["string", "string"]
}`;

    const userPrompt = `Crie meu cronograma de estudos.

- Data atual: ${body.data_atual}
- Data da prova: ${body.data_prova}
- Tempo disponível por dia: ${body.tempo_diario} horas
- Preferência de horário: ${body.preferencia ?? "não informada"}
- Conteúdos:
${body.conteudos
  .map(
    (c, i) =>
      `${i + 1}. ${c.nome} — dificuldade ${c.dificuldade}/5${c.prioridade ? ` — prioridade ${c.prioridade}` : ""}`
  )
  .join("\n")}

Gere o JSON do cronograma agora.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: "Falha no AI Gateway", detail: txt }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(JSON.stringify({ error: "IA retornou JSON inválido", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
