import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI to prevent startup crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini API Client successfully initialized.");
    } else {
      console.warn("GEMINI_API_KEY is not defined or is placeholder. Using clinical sandbox simulator mode.");
    }
  }
  return aiClient;
}

// REST API Endpoints

// 1. Health & Configuration Check
app.get("/api/config", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "ok",
    hasAiKey: hasKey,
    message: hasKey 
      ? "IA ativa usando a chave do projeto no Gemini." 
      : "Rodando em modo simulação. Insira a GEMINI_API_KEY nas Configurações do AI Studio se quiser respostas reais."
  });
});

// 2. Clinical Decision Support (Triage, Diagnosis, Evidence, Documentation)
app.post("/api/clinical-decision", async (req, res) => {
  const { task, patient, customQuery } = req.body;
  const ai = getAiClient();

  if (!task) {
    return res.status(400).json({ error: "O campo 'task' é obrigatório." });
  }

  // Fallback Simulator Data for offline or keyless runs
  const getSimulationResponse = () => {
    switch (task) {
      case "triage":
        return {
          prioridade: "URGENTE",
          cor: "yellow", // yellow, orange, red, green, blue
          justificativa: "Paciente apresenta cefaleia súbita e intensa associada a hipertensão arterial moderada (150/95 mmHg), necessitando de avaliação médica precoce para afastar eventos vasculares agudos.",
          sinais_alerta: ["Cefaleia de início súbito", "Hipertensão arterial sistêmica", "Histórico familiar de aneurisma cerebral"],
          acoes_imediatas: [
            "Aferição periódica de sinais vitais a cada 15 minutos.",
            "Manter paciente em repouso no leito, cabeceira a 30 graus.",
            "Garantir acesso venoso periférico calibroso se houver piora da intensidade.",
            "Solicitação prioritária de Tomografia Computadorizada de Crânio se persistir refratário."
          ]
        };
      case "diagnosis":
        return {
          diagnosticos: [
            {
              doenca: "Crise Enxaquecosa com Aura",
              probabilidade: "65%",
              evidencia: "Cefaleia latejante unilateral esquerda acompanhada de náuseas, fotocofobia e escotomos cintilantes visuais que precederam a dor.",
              exames: ["Nenhum exame de imagem obrigatório se padrão habitual.", "Ressonância de encéfalo em caso de primeira crise ou mudança de padrão."],
              conduta_inicial: "Sumpatriptano 6mg SC ou Oral + Metoclopramida 10mg IV. Manter em ambiente escuro."
            },
            {
              doenca: "Cefaleia Tensional Episódica",
              probabilidade: "20%",
              evidencia: "Instalação gradual, mas a intensidade acentuada e sintomas visuais tornam esta opção menos provável que enxaqueca.",
              exames: ["Avaliação clínica geral e palpação muscular pericraniana."],
              conduta_inicial: "Dipirona 1g IV ou Cetoprofeno 100mg IV."
            },
            {
              doenca: "Cefaleia Secundária a Hipertensão / Pós-Estresse ou Risco de Sangramento",
              probabilidade: "15%",
              evidencia: "Elevação tensional (150/95 mmHg) concomitante. É vital excluir eventos de refratariedade ou cefaleia sentinela.",
              exames: ["Tomografia computadorizada de crânio sem contraste", "Fundoscopia ocular (afastar edema de papila)."],
              conduta_inicial: "Controle analgésico rigoroso. Evitar redução abrupta de PA com anti-hipertensivos sublinguais."
            }
          ]
        };
      case "evidence":
        return {
          pergunta: customQuery || "Interações e condutas para Cefaleia Refratária",
          evidencia_cientifica: "De acordo com as diretrizes da Sociedade Brasileira de Cefaleia (SBCe) e da American Headache Society (2025):\n\n1. **Triptanos + Ergotamina:** Estão contraindicados para uso simultâneo em um intervalo menor que 24 horas devido ao risco sinérgico de vasoespasmo coronariano e vascular periférico.\n2. **Uso abusivo de analgésicos:** O uso de analgésicos comuns por mais de 10 dias no mês perpetua a cefaleia por rebote neurovascular.\n3. **Bloqueio de Nervo Occipital:** Em casos de enxaqueca refratária em pronto-socorro, o bloqueio anestésico com lidocaína a 1% ou 2% apresenta evidência sólida (Nível A) com rápido alívio álgico e evitação de internações.",
          referencias: [
            "Headache Journal - American Headache Society Consensus Statement, 2024.",
            "Diretrizes para o Tratamento de Crise de Enxaqueca - Sociedade Brasileira de Cefaleia, 2023.",
            "Cochrane Systematic Reviews on Neuropathic & Acute Pain Interventions, 2025."
          ]
        };
      case "admin_summary":
        return {
          documento_titulo: "Evolução e Receita de Alta Recomendada pelo Assistente",
          conteudo: `EVOLUÇÃO CLÍNICA - PRONTUÁRIO ELETRÔNICO DO PACIENTE\n=======================================================\nDATA: ${new Date().toLocaleDateString('pt-BR')} | HORA: ${new Date().toLocaleTimeString('pt-BR')}\nIDENTIFICAÇÃO: Paciente estável, admitido com cefaleia intensa.\nEXAME FÍSICO: Bom estado geral, corado, hidratado. Pupilas isocóricas e fotorreagentes. Sem sinais meningeos. Sinais vitais estabilizados pós-medicação.\nCONDUTA: Alta médica após melhora completa dos sintomas com analgesia institutiva.\n\nRECEITUÁRIO MÉDICO RECOMENDADO\n-----------------------------\n1. Dipirona Monoidratada 1g -------------- Tomar 1 comprimido VO de 6 em 6 horas se dor.\n2. Maxalt (Rizatriptana) 10mg ----------- Tomar 1 comprimido VO se sintomas de aura ou início de dor forte. (Máximo de 2 comprimidos em 24h)\n3. Plasil (Metoclopramida) 10mg --------- Tomar 1 comprimido VO de 8 em 8 horas se náusea.\n\nORIENTAÇÕES DE ALTA:\n- Repouso em local silencioso e escuro durante as crises.\n- Procurar imediatamente o pronto-socorro se houver cefaleia de início explosivo súbito ("dor tipo trovão"), febre, rigidez de nuca ou perda de força de um lado do corpo.`
        };
      case "prescription":
        return {
          documento_titulo: "RECEITUÁRIO MÉDICO DIGITAL",
          medicamentos: [
             { nome: "Dipirona Monoidratada 1g", posologia: "Tomar 1 comprimido VO de 6 em 6 horas se dor intensa" },
             { nome: "Maxalt (Rizatriptana) 10mg", posologia: "Tomar 1 comprimido VO se sintomas de aura" }
          ],
          orientacoes: "Repouso em local silencioso e escuro durante as crises.",
          medico_nome: "Dr. Assistente KlikHealth",
          medico_crm: "CRM 00000-SP",
          assinatura_digital: "SIMULAÇÃO-E4F8-D9B1"
        };
      default:
        return { mensagem: "Ação não identificada no simulador." };
    }
  };

  if (!ai) {
    // Return simulator output if no AI key
    return res.json({ 
      source: "simulation_mode",
      data: getSimulationResponse() 
    });
  }

  try {
    const patientStr = JSON.stringify(patient || {});
    
    if (task === "triage") {
      const prompt = `Você é um Assistente Médico Inteligente especialista em triagem hospitalar baseada no Protocolo de Manchester.
Analise os seguintes dados do paciente e retorne de forma estrita em formato JSON no esquema solicitado.

Dados do Paciente:
${patientStr}

Regras de Triagem (Manchester):
- IMEDIATO (Vermelho): Risco iminente de morte, parada cardiorrespiratória, choque, convulsão activa, alteração grave do nível de consciência.
- MUITO URGENTE (Laranja): Dor de intensidade extrema, alteração aguda de sinais vitais severa, risco moderado de deterioração rápida.
- URGENTE (Amarelo): Dor moderada a severa, cefaleia súbita, elevação tensional sem sinais de lesão de órgão-alvo imediata, vômitos refratários, idosos/crianças com queixas agudas.
- POUCO URGENTE (Verde): Sintomas leves, quadros subagudos ou crônicos sem novos sinais de alarme, PA levemente alterada.
- NAO_URGENTE (Azul): Consultas crônicas, queixas de longa data com sinais estáveis.

O JSON retornado deve ter exatamente os seguintes campos:
{
  "prioridade": "IMEDIATO" | "MUITO_URGENTE" | "URGENTE" | "POUCO_URGENTE" | "NAO_URGENTE",
  "cor": "red" | "orange" | "yellow" | "green" | "blue",
  "justificativa": "Texto científico explicando a escolha com base nos sintomas e sinais vitais descritos",
  "sinais_alerta": ["Sinal 1", "Sinal 2", ...],
  "acoes_imediatas": ["Ação 1", "Ação 2", ...]
}
Importante: O retorno deve conter apenas o JSON válido, sem tags markdown adicionais externas ou caracteres estranhos.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prioridade: { type: Type.STRING },
              cor: { type: Type.STRING },
              justificativa: { type: Type.STRING },
              sinais_alerta: { type: Type.ARRAY, items: { type: Type.STRING } },
              acoes_imediatas: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["prioridade", "cor", "justificativa", "sinais_alerta", "acoes_imediatas"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ source: "gemini_api", data: parsed });

    } else if (task === "diagnosis") {
      const prompt = `Você é uma Inteligência Artificial Médica altamente avançada e especialista em Diagnóstico Diferencial Clínico Baseado em Evidências Científicas.
Analise os dados do paciente abaixo e retorne uma lista estruturada de hipóteses diagnósticas diferenciais em formato JSON.

Dados do Paciente:
${patientStr}

Seu JSON de saída deve seguir precisamente esta estrutura de tipos:
{
  "diagnosticos": [
    {
      "doenca": "Nome clássico da patologia sugerida",
      "probabilidade": "Porcentagem estimada em texto (Ex: '70%')",
      "evidencia": "Explicação científica ligando as manifestações e o histórico do paciente a esta hipótese",
      "exames": ["Lista de exames solicitados prioritários para confirmar/afastar"],
      "conduta_inicial": "Conduta de emergência ou prescrição imediata recomendada de acordo com consensos atuantes"
    }
  ]
}
Retorne apenas o JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosticos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    doenca: { type: Type.STRING },
                    probabilidade: { type: Type.STRING },
                    evidencia: { type: Type.STRING },
                    exames: { type: Type.ARRAY, items: { type: Type.STRING } },
                    conduta_inicial: { type: Type.STRING }
                  },
                  required: ["doenca", "probabilidade", "evidencia", "exames", "conduta_inicial"]
                }
              }
            },
            required: ["diagnosticos"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ source: "gemini_api", data: parsed });

    } else if (task === "evidence") {
      const queryPrompt = customQuery || "Recomendações terapêuticas gerais e compatibilidades medicamentosas.";
      const prompt = `Você é um pesquisador médico de elite para o KlikHealth AI.
Forneça uma revisão científica e recomendações baseadas em evidências para os sintomas descritos do paciente e a seguinte consulta de interesse médico de forma objetiva, profissional e segura.

Dados do Paciente:
${patientStr}

Consulta Médica de Interesse:
"${queryPrompt}"

Sua resposta deve ser estruturada sob o seguinte formato JSON estrito:
{
  "pergunta": "Título conciso da consulta de evidências pesquisada",
  "evidencia_cientifica": "Texto detalhado em português com mecanismos, dose recomendada, diretrizes nacionais/internacionais e alertas de segurança do paciente.",
  "referencias": ["Referência bibliográfica 1", "Referência 2", ...]
}
Retorne exclusivamente o JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pergunta: { type: Type.STRING },
              evidencia_cientifica: { type: Type.STRING },
              referencias: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["pergunta", "evidencia_cientifica", "referencias"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ source: "gemini_api", data: parsed });

    } else if (task === "admin_summary") {
      const prompt = `Você é um assistente cirúrgico e clínico focado em diminuir a carga administrativa (paperwork) dos médicos.
Gere um rascunho de documento médico formal de evolução ou alta hospitalar com base nos dados do seguinte paciente, seus sintomas e o fato de estar recebendo alta com melhora.

Dados do Paciente:
${patientStr}

Sua resposta deve ser estruturada sob o formato JSON estrito:
{
  "documento_titulo": "Título formal do documento de prontuário ou receita gerada",
  "conteudo": "Texto completo do prontuário formatado de forma limpa, técnica e profissional em português para cópia rápida pelo médico."
}
Retorne apenas o JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documento_titulo: { type: Type.STRING },
              conteudo: { type: Type.STRING }
            },
            required: ["documento_titulo", "conteudo"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ source: "gemini_api", data: parsed });
    } else if (task === "prescription") {
      const prompt = `Você é um médico especialista prescrevendo medicamentos para o paciente assistido.
Crie um receituário médico apropriado e seguro baseado no diagnóstico provável avaliado a partir dos sintomas listados abaixo.

Dados do Paciente:
${patientStr}

Formate a prescrição rigorosamente em JSON:
{
  "documento_titulo": "RECEITUÁRIO MÉDICO DIGITAL",
  "medicamentos": [
    { "nome": "Nome do medicamento e quantidade", "posologia": "Como usar detalhadamente (VO, IV, horários) e dias" }
  ],
  "orientacoes": "Orientações gerais não medicamentosas (repouso, alimentação, sinais de alarme)",
  "medico_nome": "Dr(a). Assistente KlikHealth",
  "medico_crm": "CRM 99999-BR",
  "assinatura_digital": "9aC3-F7bB-42D1-A0E8-5x9F"
}
Retorne apenas JSON válido.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documento_titulo: { type: Type.STRING },
              medicamentos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nome: { type: Type.STRING },
                    posologia: { type: Type.STRING }
                  },
                  required: ["nome", "posologia"]
                }
              },
              orientacoes: { type: Type.STRING },
              medico_nome: { type: Type.STRING },
              medico_crm: { type: Type.STRING },
              assinatura_digital: { type: Type.STRING }
            },
            required: ["documento_titulo", "medicamentos", "orientacoes", "medico_nome", "medico_crm", "assinatura_digital"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ source: "gemini_api", data: parsed });
    }

    res.status(400).json({ error: "Tarefa desconhecida." });

  } catch (error: any) {
    console.error("Erro na requisição para o Gemini:", error);
    res.status(500).json({ 
      error: "Falha na comunicação com a API do Gemini. Usando simulação.",
      message: error.message,
      data: getSimulationResponse()
    });
  }
});

// 3. Simulated Telemedicine & Patient Dialogue Chat Interface
app.post("/api/virtual-consultation-chat", async (req, res) => {
  const { messages, userProfile } = req.body;
  const ai = getAiClient();

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "O histórico de mensagens é obrigatório." });
  }

  const defaultReply = "Olá! Sou o assistente médico virtual plantonista de triagem da nossa clínica. Para ajudá-lo de forma segura e rápida na escolha do seu horário e encaminhamento especial, poderia descrever quais sintomas principais você está sentindo e a quanto tempo iniciaram?";

  if (!ai) {
    // Offline / Simulator fallback chat responses
    const lastMsg = messages[messages.length - 1]?.text || "";
    let reply = defaultReply;
    
    if (lastMsg.toLowerCase().includes("dor") || lastMsg.toLowerCase().includes("cefaleia") || lastMsg.toLowerCase().includes("cabeça")) {
      reply = "Entendi perfeitamente. Dores de cabeça podem ser incapacitantes. Para sua segurança clínica, além da dor, você está com febre, pescoço endurecido, alterações na visão ou vômitos? Se sim, recomendo a ida imediata ao pronto atendimento. Se for uma dor habitual de estresse, temos o Dr. Eduardo Rocha (Neurologista) com horários livres hoje às 14:30 ou 16:00. O que prefere?";
    } else if (lastMsg.toLowerCase().includes("febre") || lastMsg.toLowerCase().includes("tosse") || lastMsg.toLowerCase().includes("gripe")) {
      reply = "Sintomas respiratórios ou febre moderada necessitam avaliação cautelosa. Mantenha-se bem hidratado. Temos a Dra. Juliana Costa (Clínica Geral) com consulta virtual disponível hoje às 11:15 ou amanhã às 09:00. Gostaria de agendar um destes horários?";
    } else if (lastMsg.toLowerCase().includes("1" ) || lastMsg.toLowerCase().includes("agendar") || lastMsg.toLowerCase().includes("quero")) {
      reply = "Perfeito! Seu agendamento de consulta virtual foi pré-confirmado em nosso sistema para o primeiro horário disponível. Você receberá um alerta automático e em instantes o médico entrará em contato na nossa sala virtual privada. Mantenha os seus aparelhos ligados!";
    }

    return res.json({ 
      source: "simulation_mode",
      reply: reply 
    });
  }

  try {
    // Reconstruct conversation for Gemini
    const chatHistory = messages.map((m: any) => {
      return `${m.sender === 'patient' ? 'Paciente' : 'Clínico IA'}: ${m.text}`;
    }).join("\n");

    const prompt = `Você é o chatbot de triagem inteligente e acolhimento humano da nossa clínica virtual ('Atendimento Virtual Médica de Triagem').
O usuário é um paciente buscando agendamento de consulta médica por vídeo ou chat com um especialista disponível.
Sua missão é:
1. De forma acolhedora, objetiva e segura, ouvir as queixas do paciente (sintomas e tempo de duração).
2. Fornecer orientações de cuidados gerais de saúde seguros baseados em evidência (Dizendo para procurar o Hospital de imediato em caso de sinais graves como dispneia forte, dor no peito irradiando, paralisia súbita de membros).
3. Oferecer feedback claro sobre especialidades recomendadas e opções de horários de consulta com médicos de nossa clínica fictícia (temos Dr. Eduardo Rocha - Neurologista, Dra. Juliana Costa - Clínica Geral, Dr. Henrique Azevedo - Cardiologista).
4. Escrever em português natural do Brasil, sem gírias inadequadas, mantendo empatia profissional de enfermagem/medicina.

Perfil do paciente:
${JSON.stringify(userProfile || {})}

Histórico de Conversação:
${chatHistory}

Escreva apenas a próxima resposta do plantonista clínico IA, sem prefixos, de forma humana, corta e direta.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um assistente de recepção médica e acolhimento clínico inteligente e empático."
      }
    });

    const replyText = response.text || defaultReply;
    return res.json({ source: "gemini_api", reply: replyText });

  } catch (error: any) {
    console.error("Erro no chat clínico:", error);
    return res.json({ 
      source: "simulation_mode",
      reply: "Peço desculpas pelo atraso tecnológico no processamento! Nossos médicos recomendam repouso e hidratação. Estamos confirmando sua prioridade com a recepção humana. Qual horário entre 14:00 e 16:30 hoje seria o melhor para você?" 
    });
  }
});

// Wrap static file serving and Vite dev middleware inside async block to resolve top-level await in CommonJS compilation
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical failure during Express + Vite bootstrapping:", err);
});
