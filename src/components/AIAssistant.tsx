/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, ShieldCheck, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  dbContext: any;
}

export default function AIAssistant({ dbContext }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Saya adalah **AI Procurement Assistant FORSDIG**. Saya siap membantu Anda menganalisis kelayakan penawaran, mengidentifikasi risiko keterlambatan proyek, menilai skor kepatuhan kontraktor, serta merangkum klausul kontrak sesuai standar nasional LPJK.\n\nApa spesifikasi teknis yang ingin Anda konsultasikan hari ini?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: "user", content: textToSend }]);
    if (!customMessage) setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: textToSend }],
          context: dbContext
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI model.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("AI Assistant Communication error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Mohon maaf, terjadi gangguan jaringan sistem saat menghubungi AI procurement engine. Silakan coba kembali sesaat lagi."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const templatePrompts = [
    { label: "Cari Kontraktor Terbaik", query: "Berdasarkan list database kontraktor yang ada, siapa kontraktor terbaik untuk proyek struktur?" },
    { label: "Analisa Risiko Proyek", query: "Mari lakukan analisa risiko keterlambatan pengerjaan tanah dan beton untuk Flyover Kuningan." },
    { label: "Analisa Harga Penawaran", query: "Bagaimana kelayakan harga penawaran bid dari para kontraktor terhadap HPS tender Kuningan?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-3 rounded-full shadow-2xl hover:bg-blue-500 transition-all border border-blue-400/20 font-sans shadow-blue-500/10 cursor-pointer"
        id="btn-ai-toggle"
      >
        <Bot className="w-5 h-5 animate-pulse text-white" />
        <span className="text-sm tracking-wide">FORSDIG AI Partner</span>
        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
      </button>

      {/* Slide-out Sidebar Chat Bubble */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 max-w-[calc(100vw-2rem)] h-[550px] bg-[#1E293B]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
          {/* Header */}
          <div className="bg-[#0F172A] border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/25">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">AI Procurement Advisor</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider font-semibold">ONLINE - GEMINI SECURE</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-450 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-all"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Quick Warning Bar */}
          <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800/60 flex items-center gap-2 text-[11px] text-blue-400/95 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-450 shrink-0" />
            <span>Konteks database terenkripsi & tersinkronisasi otomatis.</span>
          </div>

          {/* Message List */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F172A]/90 scrollbar-thin">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-650 text-white font-medium"
                      : "bg-[#1E293B]/80 border border-slate-700/40 text-slate-300"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
                <div className="max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs bg-[#1E293B]/85 border border-slate-700/40 text-slate-400 italic flex items-center gap-2">
                  <span>Mentranslasi parameter BOQ dari AI engine...</span>
                </div>
              </div>
            )}
          </div>

          {/* Templates Drawer */}
          <div className="px-4 py-2 bg-[#0F172A] border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Pertanyaan Templet Cepat</span>
            <div className="flex flex-wrap gap-1.5">
              {templatePrompts.map((p, idx) => (
                <button
                  key={idx}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(p.query)}
                  className="bg-[#1E293B]/50 hover:bg-[#1E293B] border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 px-2 py-1 rounded-md transition-all text-left"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Panel */}
          <div className="p-3 bg-[#0F172A] border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              placeholder="Konsultasi analisa risiko, BOQ harga..."
              className="flex-1 bg-[#1E293B]/40 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-550 transition-all font-sans"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-2 rounded-lg transition-all cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
