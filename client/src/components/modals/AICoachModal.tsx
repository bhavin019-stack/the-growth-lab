import React, { useState, useEffect, useRef } from 'react';
import { X, Send, BrainCircuit, Sparkles, AlertCircle, Key, RefreshCw, BookOpen } from 'lucide-react';
import { sendAIChat } from '../../services/api';
import { AppState } from '../../types';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onOpenSettings: () => void;
  contextSubject?: string;
  contextDocTitle?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  source?: string;
  warning?: string;
  timestamp: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  appState,
  onOpenSettings,
  contextSubject,
  contextDocTitle
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'coach',
      text: "I am your AI Learning Coach inside The Growth Lab. I am here to be your critical thinking partner—challenging assumptions, highlighting trade-offs, and grounding answers in your actual MBA course materials. What are you building or analyzing today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasApiKey = Boolean(appState.settings.geminiApiKey || appState.settings.openaiApiKey);

  const quickPrompts = [
    "Challenge my current business assumptions",
    "Explain this concept step-by-step",
    "Identify hidden trade-offs in this decision",
    "How does this apply to supply chain operations?",
    "Summarize grounded takeaway from uploaded course material"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendAIChat(prompt, {
        subject: contextSubject,
        docTitle: contextDocTitle,
        learningGoals: appState.profile.learningGoals,
        targetRoles: appState.profile.targetRoles
      });

      const coachMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        sender: 'coach',
        text: response.text || 'No response generated.',
        source: response.source,
        warning: response.warning,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, coachMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `c-err-${Date.now()}`,
          sender: 'coach',
          text: `Unable to connect to AI engine (${err.message}). Showing built-in critical reasoning guideline: When analyzing business dilemmas, always ask what evidence would prove your hypothesis false.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-charcoal-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-canvas-card border border-canvas-border w-full max-w-2xl h-[85vh] rounded-2xl shadow-warm-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-canvas-border flex items-center justify-between bg-canvas-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ink-500 text-white flex items-center justify-center shadow-warm-sm">
              <BrainCircuit className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-charcoal-900 text-sm md:text-base">
                  AI Learning Coach
                </h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  hasApiKey 
                    ? 'bg-forest-50 text-forest-700 border border-forest-200' 
                    : 'bg-ochre-50 text-ochre-700 border border-ochre-200'
                }`}>
                  {hasApiKey ? 'Live Gemini Engine' : 'Built-in Reasoning Engine'}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Critical thinking partner • Never an agreement machine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!hasApiKey && (
              <button
                onClick={onOpenSettings}
                className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-terracotta-600 hover:text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 px-2.5 py-1 rounded-lg border border-terracotta-200 transition-colors"
                title="Add Gemini API key in Settings"
              >
                <Key className="w-3 h-3" />
                <span>Connect Key</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-canvas rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grounding Context Banner if applicable */}
        {(contextSubject || contextDocTitle) && (
          <div className="px-4 py-2 bg-ink-50/50 border-b border-ink-100 flex items-center gap-2 text-xs text-ink-700">
            <BookOpen className="w-3.5 h-3.5 text-ink-600 shrink-0" />
            <span className="truncate">
              Grounded in active academic context: <strong>{contextDocTitle || contextSubject}</strong>
            </span>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-terracotta-500 text-white rounded-br-none shadow-warm-sm'
                    : 'bg-canvas-subtle border border-canvas-border text-charcoal-800 rounded-bl-none shadow-warm-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                {msg.warning && (
                  <p className="mt-2 text-[10px] text-amber-600 bg-amber-50 p-1.5 rounded border border-amber-200">
                    {msg.warning}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-charcoal-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-charcoal-400 text-xs p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-terracotta-500" />
              <span>Analyzing logic, questioning assumptions...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 border-t border-canvas-border bg-canvas-subtle/50 overflow-x-auto flex gap-1.5">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-canvas-card border border-canvas-border hover:border-terracotta-400 hover:text-terracotta-700 text-charcoal-600 transition-colors shadow-warm-sm"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-canvas-border bg-canvas-card flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Coach to critique reasoning or explain a concept..."
            className="flex-1 bg-canvas-subtle border border-canvas-border rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all placeholder:text-charcoal-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white shadow-warm-sm transition-all"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
