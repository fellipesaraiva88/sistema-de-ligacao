import React, { useState, useEffect } from "react";
import { PromptConfig } from "../types";
import { 
  defaultRealEstateConfig, 
  defaultProteautoConfig, 
  defaultEsteticaConfig, 
  defaultInfoprodutoConfig, 
  defaultSaasConfig, 
  defaultSolarConfig 
} from "../templates";
import { Sparkles, ArrowRight, ArrowLeft, Target, HeartHandshake, User, Trophy, ShieldCheck, Globe, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

interface OnboardingProps {
  onComplete: (config: PromptConfig) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [nicho, setNicho] = useState<"realestate" | "proteauto" | "estetica" | "infoproduto" | "saas" | "solar" | "custom">("estetica");
  const [urlOrHandle, setUrlOrHandle] = useState("");
  const [leadSource, setLeadSource] = useState("Facebook Ads (Tráfego Pago)");
  const [tone, setTone] = useState("Consultivo & Empático");

  // Scraper status states
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccess, setScrapeSuccess] = useState(false);
  const [customConfig, setCustomConfig] = useState<PromptConfig | null>(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingTexts = [
    "Iniciando rastreador inteligente...",
    "Conectando ao site/Instagram e obtendo cabeçalhos...",
    "Mapeando nicho comercial e proposta de valor principal...",
    "Estruturando dores profundas do cliente ideal...",
    "Invocando Gemini 3.5 para desenhar as respostas de quebra de objeções...",
    "Quase pronto, forjando o clone de voz perfeito com toques humanos..."
  ];

  useEffect(() => {
    let interval: any;
    if (scrapeLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [scrapeLoading]);

  const handleStartScraping = async () => {
    if (!urlOrHandle.trim()) {
      setScrapeError("Por favor, forneça um site ou Instagram válido.");
      return;
    }

    setScrapeLoading(true);
    setScrapeError(null);
    setScrapeSuccess(false);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urlOrHandle: urlOrHandle.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha na resposta do servidor de raspagem.");
      }

      const rawData = await response.json();
      
      const generated: PromptConfig = {
        id: `scraped-${Date.now()}`,
        name: `${rawData.agentName || "Consultora"} - ${rawData.companyName || "Personalizado"}`,
        agentName: rawData.agentName || "Consultora",
        agentAge: 27,
        agentRole: rawData.agentRole || "Consultora Especialista",
        companyName: rawData.companyName || "Sua Empresa",
        productFocus: rawData.productFocus || "Produtos Premium",
        leadSource: "Instagram e Redes Sociais",
        targetCity: rawData.targetCity || "Florianópolis - SC",
        focusNeighborhoods: rawData.focusNeighborhoods || "Região Premium",
        experienceYears: 4,
        childrenText: "mãe de 1 filho",
        agentTone: rawData.agentTone || "Extremamente profissional, consultiva e empática",
        mainPains: rawData.mainPains || [
          "Falta de transparência e demora no atendimento inicial",
          "Medo de investir alto sem garantias claras de suporte"
        ],
        humanTouchVariation: rawData.humanTouchVariation || "Dando uma tosse leve: 'Cof, desculpa... Deixa eu ajeitar meu fone... Mas então, como eu tava te dizendo...'",
        objections: rawData.objections || [
          {
            title: "Preço está elevado",
            response: "Entendo perfeitamente, o valor do investimento chama atenção. No entanto, se avaliarmos o retorno que essa solução traz e a dor de cabeça que você poupa com suporte rápido, o custo acaba se pagando logo no primeiro mês."
          }
        ]
      };

      setCustomConfig(generated);
      setScrapeSuccess(true);
      // Advance to review step
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setScrapeError(err.message || "Erro de conexão ao simular a raspagem. Certifique-se de configurar a GEMINI_API_KEY.");
    } finally {
      setScrapeLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && nicho === "custom" && !scrapeSuccess) {
      handleStartScraping();
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Build finalized config based on choices
      let baseConfig: PromptConfig;
      
      if (nicho === "custom" && customConfig) {
        baseConfig = { ...customConfig };
        baseConfig.leadSource = leadSource;
      } else {
        if (nicho === "realestate") {
          baseConfig = { ...defaultRealEstateConfig };
        } else if (nicho === "proteauto") {
          baseConfig = { ...defaultProteautoConfig };
        } else if (nicho === "estetica") {
          baseConfig = { ...defaultEsteticaConfig };
        } else if (nicho === "infoproduto") {
          baseConfig = { ...defaultInfoprodutoConfig };
        } else if (nicho === "saas") {
          baseConfig = { ...defaultSaasConfig };
        } else {
          baseConfig = { ...defaultSolarConfig };
        }

        baseConfig.leadSource = leadSource;
        if (tone === "Super Enérgico & Assertivo") {
          baseConfig.agentTone = "Extremamente enérgica, persuasiva, focada em resultados e de comando forte";
        } else if (tone === "Coloquial e Amigável") {
          baseConfig.agentTone = "Muito amigável, acolhedora, coloquial do dia-a-dia, que faz piadas sutis e sorri na voz";
        } else {
          // If template has customized tone, keep it, otherwise consulting
          if (!baseConfig.agentTone) {
            baseConfig.agentTone = "Consultiva profunda, paciente, empática, didática e focada em resolver o problema do cliente";
          }
        }
      }

      onComplete(baseConfig);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-3 sm:p-6 md:p-8" id="onboarding-container">
      <div className="max-w-2xl w-full bg-white border-[4px] border-[#000] shadow-[12px_12px_0px_#000] rounded-2xl overflow-hidden flex flex-col">
        {/* Step Indicator Top Bar */}
        <div className="bg-[#00FF41]/10 border-b-[4px] border-[#000] p-4 flex items-center justify-between font-mono text-xs">
          <span className="font-bold uppercase tracking-widest text-slate-700">Etapa de Configuração Comercial</span>
          <span className="bg-black text-[#00FF41] px-2 py-1 font-black rounded-sm">{step} de 4</span>
        </div>

        {/* Step Content */}
        <div className="p-5 sm:p-7 flex-1 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#00FF41] border-[3px] border-[#000] flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_#000] mb-2">
                01
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight">
                Seu nicho de atuação ou marca comercial
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Selecione um dos nossos <strong>4 nichos comerciais pré-calibrados</strong> de alta conversão ou use o analisador de site/Instagram para criar um clone exclusivo:
              </p>

              {/* Grid Layout of Nichos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setNicho("estetica");
                    setScrapeSuccess(false);
                  }}
                  className={`p-3 text-left border-[2.5px] border-black transition-all flex items-start gap-2.5 rounded-lg ${
                    nicho === "estetica"
                      ? "bg-[#00FF41]/10 border-[#000] shadow-[4px_4px_0px_#000] -translate-x-0.5 -translate-y-0.5 font-bold"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="w-8 h-8 bg-rose-500 text-white rounded-lg border-[2px] border-black flex items-center justify-center shrink-0 text-sm">
                    💄
                  </div>
                  <div>
                    <h4 className="font-bold text-[11px] uppercase leading-tight">Estética & Clínicas</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">Harmonização, botox e autocuidado. Quebra de medo de artificialidade.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setNicho("infoproduto");
                    setScrapeSuccess(false);
                  }}
                  className={`p-3 text-left border-[2.5px] border-black transition-all flex items-start gap-2.5 rounded-lg ${
                    nicho === "infoproduto"
                      ? "bg-[#00FF41]/10 border-[#000] shadow-[4px_4px_0px_#000] -translate-x-0.5 -translate-y-0.5 font-bold"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-lg border-[2px] border-black flex items-center justify-center shrink-0 text-sm">
                    💡
                  </div>
                  <div>
                    <h4 className="font-bold text-[11px] uppercase leading-tight">Mentorias B2B / Infoprodutos</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">Escalar faturamento para liberais e PMEs. Superar falta de tempo.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setNicho("saas");
                    setScrapeSuccess(false);
                  }}
                  className={`p-3 text-left border-[2.5px] border-black transition-all flex items-start gap-2.5 rounded-lg ${
                    nicho === "saas"
                      ? "bg-[#00FF41]/10 border-[#000] shadow-[4px_4px_0px_#000] -translate-x-0.5 -translate-y-0.5 font-bold"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-lg border-[2px] border-black flex items-center justify-center shrink-0 text-sm">
                    💻
                  </div>
                  <div>
                    <h4 className="font-bold text-[11px] uppercase leading-tight">Software SaaS ERP</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">Controle financeiro e automação de planilhas de forma simplificada.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setNicho("solar");
                    setScrapeSuccess(false);
                  }}
                  className={`p-3 text-left border-[2.5px] border-black transition-all flex items-start gap-2.5 rounded-lg ${
                    nicho === "solar"
                      ? "bg-[#00FF41]/10 border-[#000] shadow-[4px_4px_0px_#000] -translate-x-0.5 -translate-y-0.5 font-bold"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="w-8 h-8 bg-[#00FF41] text-black rounded-lg border-[2px] border-black flex items-center justify-center shrink-0 text-sm">
                    ☀️
                  </div>
                  <div>
                    <h4 className="font-bold text-[11px] uppercase leading-tight">Energia Solar</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">Sistemas fotovoltaicos residenciais e empresariais. Economia matemática.</p>
                  </div>
                </button>
              </div>

              {/* Custom Scraper Full Width Selector */}
              <button
                onClick={() => setNicho("custom")}
                className={`w-full p-4 text-left border-[3px] border-black transition-all flex items-start gap-3.5 rounded-xl mt-3 ${
                  nicho === "custom"
                    ? "bg-purple-900/10 border-purple-800 shadow-[6px_6px_0px_#000] -translate-y-0.5"
                    : "bg-purple-50 hover:bg-purple-100/50 border-purple-300"
                }`}
              >
                <div className="w-9 h-9 bg-purple-600 text-white rounded-xl border-[2px] border-black flex items-center justify-center shrink-0 text-lg font-bold">
                  ✨
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xs uppercase text-purple-700">Raspar e Forjar com IA (Exclusivo)</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Diga o site de vendas ou perfil do Instagram da sua empresa e criaremos as objeções, dores e roteiro perfeitos!</p>
                </div>
              </button>

              {/* Scrape Input Block (Dynamic) */}
              {nicho === "custom" && (
                <div className="p-4 bg-slate-900 text-white border-[3px] border-black rounded-xl space-y-3 animate-fade-in shadow-[6px_6px_0px_#000]">
                  <div className="flex items-center gap-1.5 text-[#00FF41]">
                    <Globe className="w-4 h-4 shrink-0 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase">Tecnologia Crawler Inteligente</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Insira o site de vendas, landing page ou arroba do Instagram do seu negócio para analisar:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={urlOrHandle}
                      onChange={(e) => setUrlOrHandle(e.target.value)}
                      placeholder="Ex: @seu_negocio ou https://meusite.com.br"
                      className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#00FF41] text-white font-mono placeholder:text-slate-600"
                      disabled={scrapeLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleStartScraping();
                        }
                      }}
                    />
                    <button
                      onClick={handleStartScraping}
                      className="bg-[#00FF41] text-black font-black uppercase text-[10px] py-2 px-3 rounded-lg flex items-center gap-1 hover:bg-white transition-all shrink-0 active:scale-95"
                      disabled={scrapeLoading}
                    >
                      {scrapeLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Lendo...
                        </>
                      ) : (
                        "Forjar ⚡"
                      )}
                    </button>
                  </div>

                  {scrapeLoading && (
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center gap-3">
                      <Loader2 className="w-4 h-4 text-[#00FF41] animate-spin shrink-0" />
                      <span className="text-[10px] text-slate-400 font-mono tracking-tight animate-pulse">
                        {loadingTexts[loadingTextIndex]}
                      </span>
                    </div>
                  )}

                  {scrapeError && (
                    <div className="bg-rose-950/40 border border-rose-900 p-3 rounded text-rose-300 text-[10px] leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{scrapeError}</span>
                    </div>
                  )}

                  {scrapeSuccess && (
                    <div className="bg-emerald-950/45 border border-emerald-900 p-3 rounded text-emerald-300 text-[11px] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Dados extraídos com maestria para <strong>{customConfig?.companyName}</strong>! Clique abaixo para avançar.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="w-12 h-12 bg-[#00FF41] border-[3px] border-[#000] flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_#000] mb-2">
                02
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                De onde vêm os seus leads de vendas?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                A origem dita o grau de curiosidade e as principais objeções de entrada. Escolha o canal de aquisição dominante:
              </p>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { title: "Facebook Ads (Tráfego Pago)", desc: "Leads que clicaram em anúncios e preencheram formulário de cadastro. Alto volume, média intenção.", icon: "👥" },
                  { title: "Prospecção Ativa (Outbound / Ligação)", desc: "Abordagem proativa direta na lista fria. Precisa quebrar barreiras de defesa rapidamente.", icon: "📞" },
                  { title: "Google Ads (Intenção de Compra)", desc: "Leads que buscaram ativamente no Google. Intenção de compra fortíssima, pesquisando preço.", icon: "🔍" }
                ].map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setLeadSource(item.title)}
                    className={`p-4 text-left border-[2px] border-black transition-all flex items-center gap-3.5 ${
                      leadSource === item.title
                        ? "bg-black text-white shadow-[4px_4px_0px_#00FF41] -translate-x-1 -translate-y-1"
                        : "bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs uppercase">{item.title}</h4>
                      <p className={`text-[11px] mt-0.5 ${leadSource === item.title ? "text-slate-300" : "text-slate-500"}`}>{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="w-12 h-12 bg-[#00FF41] border-[3px] border-[#000] flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_#000] mb-2">
                03
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                Qual o tom de voz ideal do seu clone?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                O tom define a psicologia de abordagem e a personalidade nos áudios ou textos gerados:
              </p>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { title: "Consultivo & Empático", desc: "Focado em entender profundamente, escutar, fazer perguntas abertas de valor e gerar confiança.", icon: <HeartHandshake className="w-5 h-5" /> },
                  { title: "Super Enérgico & Assertivo", desc: "Altamente direto, persuasivo, lidera a conversa do início ao fim e impõe forte ritmo de conversão.", icon: <Trophy className="w-5 h-5" /> },
                  { title: "Coloquial e Amigável", desc: "Linguagem solta, informal, com expressões locais e toques humorísticos naturais.", icon: <User className="w-5 h-5" /> }
                ].map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setTone(item.title)}
                    className={`p-4 text-left border-[2px] border-black transition-all flex items-center gap-4 ${
                      tone === item.title
                        ? "bg-[#00FF41] text-black shadow-[4px_4px_0px_#000] -translate-x-1 -translate-y-1 font-bold"
                        : "bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-xs uppercase">{item.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="w-12 h-12 bg-[#00FF41] border-[3px] border-[#000] flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_#000] mb-2">
                🚀
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                Preparação finalizada com sucesso!
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                Estamos prontos para injetar as regras de ouro no gerador e simulador. Veja os módulos ativos no seu setup:
              </p>

              <div className="bg-slate-50 border-[2px] border-black rounded-xl p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    [ATIVO] Persona: {
                      nicho === "custom" ? customConfig?.agentName : 
                      nicho === "realestate" ? "Mariana" : 
                      nicho === "proteauto" ? "Karina" : 
                      nicho === "estetica" ? "Beatriz" : 
                      nicho === "infoproduto" ? "Thiago" : 
                      nicho === "saas" ? "Amanda" : "Diego"
                    } ({nicho === "custom" ? "Extração IA de Site" : "Template Comercial"})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>[ATIVO] Mapeamento de Dores ({nicho === "custom" ? customConfig?.mainPains.length : 3} dores mapeadas)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>[ATIVO] Quebra de Objeções Realistas ({nicho === "custom" ? customConfig?.objections.length : 2} configuradas)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>[ATIVO] Toque Humano e simulação de ruídos fone</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Navigation Bottom Controls */}
        <div className="bg-slate-50 border-t-[4px] border-[#000] p-5 flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            className={`flex items-center gap-1.5 text-xs font-black uppercase py-2.5 px-4 border-[2px] border-black transition-all ${
              step === 1
                ? "opacity-30 cursor-not-allowed bg-slate-100"
                : "bg-white hover:bg-slate-100 text-slate-700 active:translate-y-0.5"
            }`}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <button
            onClick={handleNext}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#00FF41] hover:bg-black hover:text-white text-black font-black uppercase text-xs py-3 px-6 border-[2px] border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            disabled={step === 1 && nicho === "custom" && !scrapeSuccess && !scrapeLoading}
          >
            {step === 4 ? "Ativar Gerador de Prompts 🚀" : (step === 1 && nicho === "custom" ? "Iniciar Raspagem ✨" : "Continuar")}
            {step < 4 && !(step === 1 && nicho === "custom") && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}
