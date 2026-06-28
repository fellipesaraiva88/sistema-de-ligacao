import { useState, useRef, useEffect } from "react";
import { Message, PromptConfig } from "../types";
import { Send, Smartphone, Sparkles, AlertCircle, RefreshCw, UserCheck, CheckCircle2 } from "lucide-react";

interface PromptSimulatorProps {
  promptText: string;
  config: PromptConfig;
}

export default function PromptSimulator({ promptText, config }: PromptSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Start / Reset simulation with a greeting message
  const handleStartSimulation = () => {
    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content: `Alô, tudo bem? Aqui é a ${config.agentName}, sou consultora especialista da ${config.companyName} aqui em ${config.targetCity}, tá? Eu vi que você demonstrou interesse num anúncio nosso recentemente sobre ${config.productFocus} e resolvi te ligar pessoalmente pra te dar as boas-vindas. Por favor, com quem eu falo?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorMsg(null);
  };

  useEffect(() => {
    handleStartSimulation();
  }, [config.id]); // Reset whenever configuration preset changes

  // Smart quick-replies based on the current config
  const quickReplies = [
    { label: "Dizer meu nome (Roberto)", text: "Olá! Meu nome é Roberto. Estou ouvindo sim." },
    { label: "Pesquisando sem pressa", text: "Oi! Sou a Cláudia. Estou olhando só por curiosidade, sem pressa." },
    { label: "Reclamar dos juros altos", text: "Oi, aqui é o André. Mas os juros do financiamento estão muito altos agora, fica difícil." },
    { label: "Aceitar ir para o WhatsApp", text: "Pode me chamar no WhatsApp sim! É esse número mesmo com o DDD." },
  ];

  // Client-side intelligent mock fallback if API key is not configured or fails
  const getMockResponse = (userInput: string): string => {
    const inputLower = userInput.toLowerCase();
    
    if (inputLower.includes("roberto") || inputLower.includes("meu nome é") || inputLower.includes("olá") && messages.length <= 2) {
      return `Oi, Roberto, muito prazer! Tudo ótimo por aqui. Tá me ouvindo direitinho? Que bacana! Olha, eu te liguei rapidinho porque o mercado aqui de ${config.targetCity} está super aquecido, e a gente ajuda pessoas como você a encontrarem a melhor oportunidade sem dor de cabeça. Como você veio pelo anúncio do Facebook, queria te fazer duas perguntinhas rápidas pra eu entender seu momento atual de vida. Podemos conversar uns 2 minutinhos?`;
    }
    
    if (inputLower.includes("curiosidade") || inputLower.includes("pesquisando") || inputLower.includes("sem pressa")) {
      const curObj = config.objections.find(o => o.title.toLowerCase().includes("pesquisando") || o.title.toLowerCase().includes("curioso"));
      return curObj 
        ? curObj.response.replace("[Nome do Lead]", "Roberto")
        : `Que ótimo que você está pesquisando com calma! Comprar um imóvel com pressa nunca é bom. E o que despertou essa faísca agora? É a vontade de morar pertinho da praia, ter mais espaço pros filhos ou apenas tirar as economias do banco pra investir num patrimônio seguro aqui em ${config.targetCity}?`;
    }

    if (inputLower.includes("juro") || inputLower.includes("financiamento") || inputLower.includes("alto") || inputLower.includes("caro")) {
      const juroObj = config.objections.find(o => o.title.toLowerCase().includes("juro") || o.title.toLowerCase().includes("caro"));
      return juroObj 
        ? juroObj.response.replace("[Nome do Lead]", "Roberto")
        : `Entendo perfeitamente, os custos preocupam mesmo. Mas aqui em ${config.targetCity}, os imóveis valorizam mais rápido que os juros! Quem espera o juro cair acaba pagando muito mais caro pelo mesmo apartamento depois. Faz sentido pra você garantir a tabela atual e renegociar o financiamento depois?`;
    }

    if (inputLower.includes("whatsapp") || inputLower.includes("pode chamar") || inputLower.includes("número") || inputLower.includes("sim")) {
      return `Maravilha! Já estou anotando aqui o seu contato. Vou preparar as 3 melhores opções de apartamentos em ${config.focusNeighborhoods || config.targetCity} com fotos, plantas 3D e as simulações exatas das parcelas pra te mandar lá, tá? Fica de olho no seu Zap que em minutinhos te chamo! Muito obrigada pela confiança, um abraço e até já!`;
    }

    // Default fallback SPIN flow answers
    return `Perfeito! Entendi seu ponto. Inclusive, deixa eu te fazer uma pergunta que ajuda muito a clarear o seu perfil: hoje você busca um apartamento com quantos quartos e vagas? E a localização ideal seria mais residencial tranquila ou pertinho de todo o comércio e da praia?`;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);
    setErrorMsg(null);

    // If using mock mode directly (user chose to bypass API)
    if (usingMock) {
      setTimeout(() => {
        const mockReplyText = getMockResponse(textToSend);
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: mockReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setLoading(false);
      }, 900);
      return;
    }

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: promptText,
          messages: chatHistory,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Falha ao receber resposta da IA.");
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      // Fallback seamlessly to mock but warn the user
      setUsingMock(true);
      setErrorMsg(
        `Usando motor de simulação offline: ${err.message || "Erro de conexão"}. (O chat continua interativo!)`
      );
      
      const mockReplyText = getMockResponse(textToSend);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: mockReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full text-slate-100" id="prompt-simulator-container">
      {/* Device Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold relative shrink-0 shadow-lg shadow-indigo-500/20">
            {config.agentName[0]}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white flex items-center gap-1.5 font-sans">
              {config.agentName}
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-medium py-0.5 px-1.5 rounded-full border border-indigo-500/30">
                Clone Ativo
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans truncate max-w-48 sm:max-w-72">
              {config.companyName} • {config.agentRole}
            </p>
          </div>
        </div>
        <button
          onClick={handleStartSimulation}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0"
          title="Reiniciar conversa"
          id="btn-restart-simulation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Info Banner / State */}
      {errorMsg ? (
        <div className="bg-amber-950/40 border-b border-amber-900/60 text-amber-300 text-xs py-2 px-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="font-sans text-[11px] leading-tight flex-1">{errorMsg}</span>
          <button 
            onClick={() => { setUsingMock(false); setErrorMsg(null); }} 
            className="text-[10px] bg-slate-800 hover:bg-slate-700 py-0.5 px-1.5 rounded text-white"
          >
            Tentar Online
          </button>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border-b border-emerald-900/50 text-emerald-300 text-xs py-1.5 px-4 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-sans text-[11px]">Simulador conectado com inteligência Gemini 3.5.</span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[48vh] custom-scrollbar bg-slate-950/40">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {!isUser && (
                <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                  {config.agentName[0]}
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                isUser
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-slate-800/80 text-slate-100 rounded-bl-none border border-slate-700/50"
              }`}>
                <p className="font-sans leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[10px] block mt-1 text-right ${isUser ? "text-indigo-200" : "text-slate-400"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-xs text-slate-300 shrink-0">
              {config.agentName[0]}
            </div>
            <div className="bg-slate-800/80 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-300 border border-slate-700/50">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider mb-2 font-semibold">Respostas de Teste Rápidas (Simular Funil SPIN)</p>
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(reply.text)}
              className="text-xs bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/50 text-slate-300 py-1.5 px-3 rounded-xl transition-all font-sans"
              disabled={loading}
            >
              {reply.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Digite sua resposta para a ${config.agentName}...`}
          className="flex-1 bg-slate-900 text-sm border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-100"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center disabled:opacity-50"
          disabled={!inputText.trim() || loading}
          id="btn-send-message-simulator"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
