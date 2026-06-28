import { useState } from "react";
import { 
  defaultRealEstateConfig, 
  defaultProteautoConfig, 
  defaultEsteticaConfig, 
  defaultInfoprodutoConfig, 
  defaultSaasConfig, 
  defaultSolarConfig, 
  generatePromptText 
} from "./templates";
import { PromptConfig } from "./types";
import PromptForm from "./components/PromptForm";
import PromptViewer from "./components/PromptViewer";
import PromptSimulator from "./components/PromptSimulator";
import Onboarding from "./components/Onboarding";
import { Sparkles, FileText, PhoneCall, Layers, RefreshCw, BookOpen, ExternalLink, HelpCircle, Compass } from "lucide-react";

export default function App() {
  const [currentConfig, setCurrentConfig] = useState<PromptConfig>({ ...defaultEsteticaConfig });
  const [activeTab, setActiveTab] = useState<"viewer" | "simulator">("viewer");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const handleConfigChange = (updated: PromptConfig) => {
    setCurrentConfig(updated);
  };

  const handlePresetSwitch = (presetId: string) => {
    switch (presetId) {
      case "clinica-estetica":
        setCurrentConfig({ ...defaultEsteticaConfig });
        break;
      case "infoprodutos-mentorias":
        setCurrentConfig({ ...defaultInfoprodutoConfig });
        break;
      case "saas-b2b":
        setCurrentConfig({ ...defaultSaasConfig });
        break;
      case "energia-solar":
        setCurrentConfig({ ...defaultSolarConfig });
        break;
      default:
        // Keep active custom scraped config intact if selected, or default
        if (!presetId.startsWith("scraped-")) {
          setCurrentConfig({ ...defaultEsteticaConfig });
        }
    }
  };

  const handleReset = () => {
    handlePresetSwitch(currentConfig.id);
  };

  const handleOnboardingComplete = (finalConfig: PromptConfig) => {
    setCurrentConfig(finalConfig);
    setHasCompletedOnboarding(true);
  };

  const generatedPrompt = generatePromptText(currentConfig);

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans text-[#1A1A1A] antialiased p-3 sm:p-6 md:p-8" id="app-root">
      {/* Neo-brutalist Wrapper */}
      <div className="max-w-7xl mx-auto w-full bg-white border-[4px] border-[#000] shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden rounded-2xl">
        
        {/* Header Section */}
        <header className="border-b-[4px] border-[#000] flex flex-col md:flex-row items-stretch md:items-center justify-between bg-[#00FF41]/10">
          {/* Logo & Subtitle */}
          <div className="p-5 md:p-6 flex items-center gap-4 border-b-[4px] md:border-b-0 md:border-r-[4px] border-[#000] bg-white flex-1">
            <div className="w-12 h-12 bg-[#00FF41] border-[3px] border-[#000] flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_#000]">
              P
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                Clonador de Voz & Estilo 
                <span className="text-[10px] font-mono bg-black text-[#00FF41] px-1.5 py-0.5 uppercase tracking-widest rounded-sm">v3.5</span>
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-0.5">Gerador de Prompts Mestre • Conversão WhatsApp (SPIN Selling)</p>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 p-5 bg-slate-50/50 md:bg-transparent">
            <span className="text-xs font-mono font-bold uppercase text-slate-600 self-center">Cenário Comercial:</span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={currentConfig.id}
                onChange={(e) => handlePresetSwitch(e.target.value)}
                className="text-xs font-bold uppercase tracking-wide py-2 px-4 bg-white border-[2px] border-black shadow-[4px_4px_0px_#000] focus:outline-none transition-all cursor-pointer rounded-lg text-slate-800 font-mono"
                id="select-scenario"
              >
                <option value="clinica-estetica">💄 Clínica de Estética & Botox</option>
                <option value="infoprodutos-mentorias">💡 Mentorias & Infoprodutos B2B</option>
                <option value="saas-b2b">💻 SaaS / ERP de Gestão</option>
                <option value="energia-solar">☀️ Instalação Energia Solar</option>
                {currentConfig.id.startsWith("scraped-") && (
                  <option value={currentConfig.id}>✨ Extraído de: {currentConfig.companyName}</option>
                )}
              </select>
              
              <button
                onClick={() => setHasCompletedOnboarding(false)}
                className="text-xs font-bold uppercase tracking-wide py-2 px-3 border-[2px] border-black bg-black text-[#00FF41] hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 shadow-[4px_4px_0px_#00FF41] rounded-lg active:translate-y-0.5"
                title="Voltar para a etapa inicial de onboarding"
                id="btn-restart-onboarding"
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                Painel Onboarding 🚀
              </button>
            </div>
          </div>
        </header>

        {/* Feature Highlights/Instructions Banner */}
        <div className="bg-black text-white p-4 border-b-[4px] border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41] animate-pulse"></span>
            <span><strong>COMO FUNCIONA:</strong> Personalize a persona à esquerda, copie o prompt mestre ou teste na hora no simulador de chat à direita.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="opacity-70">Origem do tráfego: <strong className="text-[#00FF41]">{currentConfig.leadSource}</strong></span>
            <span className="opacity-70">Localização: <strong className="text-[#00FF41] font-sans">{currentConfig.targetCity}</strong></span>
          </div>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] divide-y-[4px] lg:divide-y-0 lg:divide-x-[4px] divide-black bg-[#F9F9F9]">
          
          {/* Left Column: Customizer parameters (Col 5) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-white flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <span>01</span> Parâmetros da Persona
              </h2>
              <span className="text-xs bg-slate-100 text-slate-700 py-0.5 px-2 font-mono border border-slate-300 font-bold uppercase">
                Edição Ativa
              </span>
            </div>
            
            <PromptForm 
              config={currentConfig} 
              onChange={handleConfigChange} 
              onReset={handleReset} 
            />

            {/* Explanatory notes under form */}
            <div className="mt-5 p-4 bg-[#F2F2F2] border-[2px] border-black rounded-xl space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wide text-slate-800 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Estrutura de Conversão (SPIN)
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Este modelo adota o framework <strong>SPIN Selling</strong> (Situação, Problema, Implicação e Necessidade de Solução) para qualificar e converter leads quentes do Facebook Ads ou de prospecção ativa diretamente para o WhatsApp sem parecer agressivo no primeiro contato.
              </p>
            </div>
          </div>

          {/* Right Column: Output / Workspace (Col 7) */}
          <div className="lg:col-span-7 flex flex-col bg-white">
            
            {/* View / Test Toggle Tabs */}
            <div className="border-b-[4px] border-black flex items-stretch bg-slate-50">
              <button
                onClick={() => setActiveTab("viewer")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-black uppercase tracking-wider transition-all border-r-[4px] border-black ${
                  activeTab === "viewer"
                    ? "bg-[#00FF41] text-black"
                    : "bg-white hover:bg-slate-100 text-slate-600"
                }`}
                id="tab-viewer"
              >
                <FileText className="w-4 h-4 shrink-0" />
                Prompt Mestre Gerado
              </button>
              <button
                onClick={() => setActiveTab("simulator")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-black uppercase tracking-wider transition-all ${
                  activeTab === "simulator"
                    ? "bg-[#00FF41] text-black"
                    : "bg-white hover:bg-slate-100 text-slate-600"
                }`}
                id="tab-simulator"
              >
                <PhoneCall className="w-4 h-4 shrink-0" />
                Simulador de Chat IA
              </button>
            </div>

            {/* Dynamic Panel Display */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
              {activeTab === "viewer" ? (
                <div className="flex-1 flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 font-mono">
                      <span>02</span> Output & Regulagem do Copypasta
                    </h2>
                    <span className="text-xs bg-indigo-50 text-indigo-700 py-0.5 px-2 font-mono border border-indigo-200 font-bold uppercase rounded-sm">
                      Pronto para Copiar
                    </span>
                  </div>
                  <PromptViewer 
                    promptText={generatedPrompt} 
                    agentName={currentConfig.agentName} 
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 font-mono">
                      <span>03</span> Teste de Comportamento em Tempo Real
                    </h2>
                    <span className="text-xs bg-emerald-50 text-emerald-700 py-0.5 px-2 font-mono border border-emerald-200 font-bold uppercase rounded-sm">
                      Simulação Ativa
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <PromptSimulator 
                      promptText={generatedPrompt} 
                      config={currentConfig} 
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer info banner */}
        <footer className="bg-slate-950 text-slate-400 p-5 border-t-[4px] border-black flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <div>
            Desenvolvido para <strong className="text-white">Floripa Dream Imóveis</strong> • Tecnologia de Engenharia de Prompts para Clones de IA.
          </div>
          <div className="flex items-center gap-1">
            <span>Sintonizado em Florianópolis - SC</span>
            <span className="text-xs text-rose-500 animate-pulse">❤</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
