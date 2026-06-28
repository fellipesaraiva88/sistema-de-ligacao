import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure GEMINI_API_KEY is available (or will be provided by user secrets at runtime)
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. Chat simulation will be unavailable.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for chat simulation with the generated agent
  app.post("/api/chat", async (req, res) => {
    try {
      const { systemInstruction, messages } = req.body;

      if (!systemInstruction) {
        return res.status(400).json({ error: "O prompt de instrução do sistema é obrigatório." });
      }

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "O histórico de mensagens é obrigatório e deve ser uma lista." });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY não configurada. Por favor, adicione sua chave de API nos Segredos do AI Studio."
        });
      }

      // Convert messages to GoogleGenAI Content format
      const formattedContents = messages.map((msg: any) => {
        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        };
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        },
      });

      const replyText = response.text || "";
      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Erro na rota de chat:", error);
      res.status(500).json({ error: error.message || "Erro interno do servidor ao gerar resposta." });
    }
  });

  // API Route for website/instagram scraping and analysis using Gemini
  app.post("/api/scrape", async (req, res) => {
    try {
      const { urlOrHandle } = req.body;
      if (!urlOrHandle || typeof urlOrHandle !== "string") {
        return res.status(400).json({ error: "A URL ou perfil do Instagram é obrigatório." });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY não configurada. Por favor, adicione sua chave de API nos Segredos do AI Studio para analisar o link."
        });
      }

      let fetchedHtmlSnippet = "";
      // Attempt a safe, brief fetch if it's a web URL
      if (urlOrHandle.startsWith("http://") || urlOrHandle.startsWith("https://")) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

          const fetchRes = await fetch(urlOrHandle, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (fetchRes.ok) {
            const rawHtml = await fetchRes.text();
            // Extract some basic snippets like title, meta description, and first headers to save tokens
            const titleMatch = rawHtml.match(/<title>([^<]+)<\/title>/i);
            const metaDescMatch = rawHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) 
              || rawHtml.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
            const headers = rawHtml.match(/<h[1-2][^>]*>([\s\S]*?)<\/h[1-2]>/gi) || [];

            fetchedHtmlSnippet = `
              Título do Site: ${titleMatch ? titleMatch[1] : "Não encontrado"}
              Descrição Meta: ${metaDescMatch ? metaDescMatch[1] : "Não encontrada"}
              Cabeçalhos principais: ${headers.slice(0, 5).map(h => h.replace(/<[^>]*>/g, "").trim()).join(" | ")}
            `;
          }
        } catch (fetchErr) {
          console.warn("Falha ao buscar URL diretamente (CORS ou restrição), confiando apenas na inferência do Gemini:", fetchErr);
        }
      }

      // Design a detailed, structured prompt for Gemini 3.5 to return clean JSON
      const parsePrompt = `
        Você é um Engenheiro de Prompts especialista em Vendas e Conversão de Clones de Voz.
        Sua tarefa é analisar o seguinte site, link de Instagram ou marca fornecida pelo usuário: "${urlOrHandle}".
        
        ${fetchedHtmlSnippet ? `Aqui está um rascunho de metadados extraídos do site para te apoiar:\n${fetchedHtmlSnippet}` : ""}

        A partir disso, use seu conhecimento profundo para prever ou simular o cenário de vendas ideal para essa marca. Nós queremos preencher uma configuração de prompt de vendas de alto padrão.
        
        Você DEVE retornar OBRIGATORIAMENTE um objeto JSON válido contendo os seguintes campos com textos profissionais, realistas e bem elaborados:
        
        {
          "companyName": "Nome da empresa real ou deduzido a partir do link",
          "productFocus": "Qual o foco do produto ou serviço principal que eles vendem (Ex: Apartamentos de luxo à beira-mar, Loteamentos em Florianópolis, Software de gestão, etc.)",
          "targetCity": "Cidade/Região ideal onde essa empresa atua (Deduza com base no link ou sugira se não houver exato)",
          "focusNeighborhoods": "Bairros mais quentes ou de maior destaque que eles atendem (Ex: Campeche, Jurerê, Centro, etc.)",
          "agentName": "Um nome fictício amigável e realista para a consultora de vendas da marca (Ex: Mariana, Camila, Gabriela, Amanda)",
          "agentRole": "Descrição curta do papel profissional do agente (Ex: Consultora especialista em imóveis na planta, Consultor de alta performance)",
          "agentTone": "Tom de voz recomendado com detalhes (Ex: 'Enérgica, acolhedora, com sotaque catarinense sutil, didática e muito segura')",
          "mainPains": [
            "Escreva de 3 a 4 dores de clientes reais extremamente profundas desse nicho (Ex: 'Medo de investir em construtoras sem histórico sólido e perder dinheiro', 'Falta de tempo para filtrar dezenas de imobiliárias ruins')",
            "Dor 2",
            "Dor 3"
          ],
          "humanTouchVariation": "Uma frase curta sugerida para simular falha humana no fone para que o clone de voz pareça 100% natural (Ex: 'Peraí, deixa eu arrumar meu fone aqui... O vento da janela tá forte... Pronto! Como eu tava te perguntando...')",
          "objections": [
            {
              "title": "A objeção mais comum desse segmento (Ex: 'Acho que os preços na planta estão inflacionados')",
              "response": "A resposta persuasiva, empática e inteligente usando a metodologia SPIN para quebrar essa objeção."
            },
            {
              "title": "Segunda objeção comum",
              "response": "Resposta persuasiva."
            },
            {
              "title": "Terceira objeção comum",
              "response": "Resposta persuasiva."
            }
          ]
        }

        Retorne APENAS o JSON válido. Não inclua blocos de markdown adicionais como \`\`\`json fora do próprio conteúdo.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: parsePrompt }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const responseText = response.text || "{}";
      const cleanJson = JSON.parse(responseText.trim());
      res.json(cleanJson);

    } catch (error: any) {
      console.error("Erro na rota de scraping:", error);
      res.status(500).json({ error: error.message || "Erro ao processar e extrair dados do site." });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
