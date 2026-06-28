import React, { useState } from "react";
import { PromptConfig } from "../types";
import { Plus, Trash2, RotateCcw, Sparkles, HelpCircle, Globe, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

interface PromptFormProps {
  config: PromptConfig;
  onChange: (updated: PromptConfig) => void;
  onReset: () => void;
}

export default function PromptForm({ config, onChange, onReset }: PromptFormProps) {
  const [newPain, setNewPain] = useState("");
  const [newObjectionTitle, setNewObjectionTitle] = useState("");
  const [newObjectionResp, setNewObjectionResp] = useState("");

  // Inline Scraper States
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccess, setScrapeSuccess] = useState(false);

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) {
      setScrapeError("Por favor, digite um site ou Instagram.");
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
        body: JSON.stringify({ urlOrHandle: scrapeUrl.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao analisar o link fornecido.");
      }

      const rawData = await response.json();

      onChange({
        ...config,
        name: `${rawData.agentName || "Consultora"} - ${rawData.companyName || "Personalizado"}`,
        agentName: rawData.agentName || config.agentName,
        agentRole: rawData.agentRole || config.agentRole,
        companyName: rawData.companyName || config.companyName,
        productFocus: rawData.productFocus || config.productFocus,
        targetCity: rawData.targetCity || config.targetCity,
        focusNeighborhoods: rawData.focusNeighborhoods || config.focusNeighborhoods,
        agentTone: rawData.agentTone || config.agentTone,
        mainPains: rawData.mainPains || config.mainPains,
        humanTouchVariation: rawData.humanTouchVariation || config.humanTouchVariation,
        objections: rawData.objections || config.objections,
      });

      setScrapeSuccess(true);
      setScrapeUrl("");
    } catch (err: any) {
      console.error(err);
      setScrapeError(err.message || "Erro ao conectar. Garanta que a GEMINI_API_KEY está configurada.");
    } finally {
      setScrapeLoading(false);
    }
  };

  const updateField = (field: keyof PromptConfig, value: any) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const handleAddPain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPain.trim()) return;
    onChange({
      ...config,
      mainPains: [...config.mainPains, newPain.trim()],
    });
    setNewPain("");
  };

  const handleRemovePain = (index: number) => {
    const updated = config.mainPains.filter((_, i) => i !== index);
    updateField("mainPains", updated);
  };

  const handleAddObjection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectionTitle.trim() || !newObjectionResp.trim()) return;
    onChange({
      ...config,
      objections: [
        ...config.objections,
        { title: newObjectionTitle.trim(), response: newObjectionResp.trim() },
      ],
    });
    setNewObjectionTitle("");
    setNewObjectionResp("");
  };

  const handleRemoveObjection = (index: number) => {
    const updated = config.objections.filter((_, i) => i !== index);
    updateField("objections", updated);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden" id="prompt-form-container">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="font-sans font-semibold text-slate-800 text-lg">Parâmetros do Clone de Vendas</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
          title="Restaurar valores padrão"
          id="btn-reset-form"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Resetar
        </button>
      </div>

      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
        {/* URL / Instagram Scraper Module */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-800">
            <Globe className="w-4 h-4 text-indigo-600 animate-pulse" />
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider">Extrair Informações via Link</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Passe o site da sua empresa, portfólio ou @ do Instagram para preencher as dores, objeções e a persona automaticamente:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="Ex: @minha_loja ou https://meusite.com.br"
              className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 font-sans"
              disabled={scrapeLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleScrape();
                }
              }}
            />
            <button
              onClick={handleScrape}
              disabled={scrapeLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {scrapeLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Rastreando...
                </>
              ) : (
                "Extrair"
              )}
            </button>
          </div>

          {scrapeLoading && (
            <div className="text-[10px] text-indigo-600 font-mono flex items-center gap-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Conectando e invocando inteligência de raspagem do Gemini...</span>
            </div>
          )}

          {scrapeError && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-600 text-[10px] leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{scrapeError}</span>
            </div>
          )}

          {scrapeSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-700 text-[10px] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Fatos e objeções integrados ao seu clone! Verifique os dados abaixo.</span>
            </div>
          )}
        </div>

        {/* Identidade Básica */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identidade da Persona</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nome da Consultora</label>
              <input
                type="text"
                value={config.agentName}
                onChange={(e) => updateField("agentName", e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                placeholder="Ex: Mariana, Karina"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Idade</label>
              <input
                type="number"
                value={config.agentAge}
                onChange={(e) => updateField("agentAge", parseInt(e.target.value) || 25)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Anos de Experiência</label>
              <input
                type="number"
                value={config.experienceYears}
                onChange={(e) => updateField("experienceYears", parseInt(e.target.value) || 1)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Detalhe Pessoal (Mãe/Pai de...)</label>
              <input
                type="text"
                value={config.childrenText}
                onChange={(e) => updateField("childrenText", e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                placeholder="Ex: mãe de dois filhos (Mavi e Léo)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Papel / Especialidade</label>
            <input
              type="text"
              value={config.agentRole}
              onChange={(e) => updateField("agentRole", e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              placeholder="Ex: Consultora especialista em proteção..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome da Empresa</label>
            <input
              type="text"
              value={config.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Produto e Segmento */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produto & Território</h3>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Foco do Produto</label>
            <input
              type="text"
              value={config.productFocus}
              onChange={(e) => updateField("productFocus", e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              placeholder="Ex: Apartamentos de médio e alto padrão"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Origem do Lead</label>
              <input
                type="text"
                value={config.leadSource}
                onChange={(e) => updateField("leadSource", e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                placeholder="Ex: Facebook Ads, Outbound"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cidade/Região Alvo</label>
              <input
                type="text"
                value={config.targetCity}
                onChange={(e) => updateField("targetCity", e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Bairros de Foco (Opcional)</label>
            <input
              type="text"
              value={config.focusNeighborhoods}
              onChange={(e) => updateField("focusNeighborhoods", e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              placeholder="Ex: Campeche, Novo Campeche, Itacorubi"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tom de Voz & Estilo</label>
            <textarea
              value={config.agentTone}
              onChange={(e) => updateField("agentTone", e.target.value)}
              rows={2}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              placeholder="Ex: Enérgica, alegre, direta..."
            />
          </div>
        </div>

        {/* Dores Principais (SPIN) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dores Mapeadas (Diagnóstico SPIN)</h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 py-0.5 px-2 rounded-full font-medium">
              {config.mainPains.length} Ativas
            </span>
          </div>

          <div className="space-y-2">
            {config.mainPains.map((pain, index) => (
              <div key={index} className="flex items-start justify-between gap-3 bg-slate-50 hover:bg-slate-100/70 p-3 rounded-xl border border-slate-100 transition-all group">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-sm text-slate-700 font-sans leading-relaxed flex-1">{pain}</p>
                <button
                  type="button"
                  onClick={() => handleRemovePain(index)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Excluir dor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddPain} className="flex gap-2">
            <input
              type="text"
              value={newPain}
              onChange={(e) => setNewPain(e.target.value)}
              placeholder="Adicionar nova dor do cliente..."
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-all shadow-xs shrink-0"
              title="Adicionar"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Toque Humano Scriptado */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toque Humano Scriptado</h3>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-[11px] p-2 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-20">
                Uma pequena falha ou interrupção planejada no diálogo para que o clone de voz ou chat pareça 100% natural e humano.
              </div>
            </div>
          </div>
          <div>
            <textarea
              value={config.humanTouchVariation}
              onChange={(e) => updateField("humanTouchVariation", e.target.value)}
              rows={2}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              placeholder="Ex: 'Peraí, deixa eu arrumar aqui meu fone...'"
            />
          </div>
        </div>

        {/* Quebra de Objeções */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tratamento de Objeções</h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 py-0.5 px-2 rounded-full font-medium">
              {config.objections.length} Cadastradas
            </span>
          </div>

          <div className="space-y-3">
            {config.objections.map((obj, index) => (
              <div key={index} className="bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-600 font-mono">OBJEÇÃO {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjection(index)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    title="Remover objeção"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 font-sans">"{obj.title}"</h4>
                <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-100 font-sans">
                  "{obj.response}"
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50/60 p-4 rounded-xl border border-dashed border-slate-200 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700">Nova Objeção & Script de Resposta</h4>
            <div>
              <input
                type="text"
                value={newObjectionTitle}
                onChange={(e) => setNewObjectionTitle(e.target.value)}
                placeholder="Ex: 'Está caro' ou 'Vou falar com meu cônjuge'"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <textarea
                value={newObjectionResp}
                onChange={(e) => setNewObjectionResp(e.target.value)}
                placeholder="Insira a resposta persuasiva e empática que a persona deve dar..."
                rows={2.5}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <button
              type="button"
              onClick={handleAddObjection}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Adicionar Objeção ao Script
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
