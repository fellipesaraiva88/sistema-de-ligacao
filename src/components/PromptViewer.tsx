import { useState } from "react";
import { Copy, Check, Download, FileText, Info } from "lucide-react";

interface PromptViewerProps {
  promptText: string;
  agentName: string;
}

export default function PromptViewer({ promptText, agentName }: PromptViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([promptText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `Prompt_Mestre_${agentName}_Clone.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Basic highlight of sections for better readability
  const renderFormattedPrompt = () => {
    const lines = promptText.split("\n");
    return lines.map((line, idx) => {
      // Main headers like "0. Pré-Interação", "1. Persona"
      if (/^[0-9]\.\s+[A-Z\xC0-\xDF]/.test(line.trim())) {
        return (
          <div key={idx} className="text-indigo-700 font-bold font-sans text-base mt-6 mb-2 border-l-4 border-indigo-500 pl-3">
            {line}
          </div>
        );
      }
      // Subheaders or fields like "Karina:", "Objeção:"
      if (line.trim().startsWith("- ") && line.includes(":")) {
        const parts = line.split(":");
        const prefix = parts[0];
        const suffix = parts.slice(1).join(":");
        return (
          <div key={idx} className="pl-4 py-0.5 text-sm leading-relaxed text-slate-700">
            <span className="font-semibold text-slate-900">{prefix}:</span>
            <span className="text-slate-600">{suffix}</span>
          </div>
        );
      }
      // Standard list items
      if (line.trim().startsWith("-")) {
        return (
          <div key={idx} className="pl-6 py-0.5 text-sm leading-relaxed text-slate-600">
            {line}
          </div>
        );
      }
      // Regular paragraphs
      return (
        <div key={idx} className={`text-sm leading-relaxed text-slate-600 ${line.trim() === "" ? "h-2" : "py-0.5"}`}>
          {line}
        </div>
      );
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full" id="prompt-viewer-container">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="font-sans font-semibold text-slate-800 text-lg">Prompt Mestre Gerado</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100/60 hover:bg-slate-100 transition-colors py-1.5 px-3 rounded-lg border border-slate-200"
            title="Download do arquivo txt"
            id="btn-download-prompt"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar .txt
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all ${
              copied
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
            }`}
            id="btn-copy-prompt"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar Prompt
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="bg-indigo-50/40 px-5 py-3 border-b border-indigo-50 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-indigo-800 leading-relaxed font-sans">
          Este prompt mestre está calibrado para clonar a persona com inteligência de negociação em vendas e técnica <strong>SPIN Selling</strong> de alta pressão e transparência. Copie-o para configurar seu bot de chat ou assistente de voz.
        </p>
      </div>

      {/* Prompt Body */}
      <div className="p-6 overflow-y-auto flex-1 max-h-[64vh] custom-scrollbar bg-slate-50/20 font-mono text-xs">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-inner space-y-1 select-all select-text selection:bg-indigo-100">
          {renderFormattedPrompt()}
        </div>
      </div>
    </div>
  );
}
