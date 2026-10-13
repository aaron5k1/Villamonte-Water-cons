import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Activity,
  X,
  Trash2,
  ChevronDown,
  Minimize2,
  Maximize2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

export type ChatRole = 'coach' | 'quick' | 'specialist';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  currentMl: number;
  goalMl: number;
  unit: string;
  streak: number;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const ROLES: {
  id: ChatRole;
  name: string;
  model: string;
  modelTag: string;
  taskType: string;
  description: string;
  icon: React.ReactNode;
  badgeColor: string;
  suggestedQuestions: string[];
}[] = [
  {
    id: 'coach',
    name: 'Hydration Coach',
    model: 'gemini-3.5-flash',
    modelTag: 'gemini-3.5-flash',
    taskType: 'General Tasks',
    description: 'Friendly guidance on daily habits, pacing, and beverage options.',
    icon: <Sparkles className="w-4 h-4 text-sky-500" />,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    suggestedQuestions: [
      'How should I pace my remaining water intake today?',
      'Can herbal tea count towards my daily water goal?',
      'How do I build a habit of drinking water early in the morning?',
    ],
  },
  {
    id: 'quick',
    name: 'Quick Sip Bot',
    model: 'gemini-3.1-flash-lite',
    modelTag: 'gemini-3.1-flash-lite',
    taskType: 'Fast Tasks',
    description: 'Instant, crisp answers and quick volume conversions.',
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    suggestedQuestions: [
      'Is cold water absorbed faster than room temp water?',
      'Convert 24 fl oz to milliliters quickly.',
      'Does sparkling water erode dental enamel?',
    ],
  },
  {
    id: 'specialist',
    name: 'Physiology Specialist',
    model: 'gemini-3.1-pro-preview',
    modelTag: 'gemini-3.1-pro-preview',
    taskType: 'Complex Tasks',
    description: 'Deep clinical & sports physiology, electrolytes, and sweat rate modeling.',
    icon: <Activity className="w-4 h-4 text-violet-500" />,
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    suggestedQuestions: [
      'Calculate my estimated sweat rate and electrolyte loss for a 10km run in 28°C.',
      'Explain plasma osmolality and how vasopressin regulates kidney water reabsorption.',
      'What is the optimal sodium-to-potassium ratio in homemade rehydration solutions?',
    ],
  },
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  currentMl,
  goalMl,
  unit,
  streak,
  isOpen,
  onToggleOpen,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatRole>('coach');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Hello! I'm your Water cons AI Assistant powered by Google Gemini. I can give you personalized hydration pacing based on your progress (${currentMl} of ${goalMl} ${unit} so far today), analyze beverages, or calculate endurance hydration physiology. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Send conversation history to server
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
          roleId: selectedRole,
          userContext: {
            currentMl,
            goalMl,
            unit,
            streak,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get a response from Gemini.');
      }

      const botMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Something went wrong while connecting to Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Conversation cleared. Ready for your next hydration question with ${activeRoleConfig.name}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: activeRoleConfig.model,
      },
    ]);
    setErrorMessage(null);
  };

  return (
    <>
      {/* Floating Toggle Button (visible when closed) */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group"
          title="Open Gemini Hydration Assistant"
        >
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
            <Bot className="w-4 h-4" />
          </div>
          <span>Gemini Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        </button>
      )}

      {/* Main Chat Interface Modal / Flyout */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[460px] h-[640px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Water cons AI</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-500/30 text-sky-300 border border-sky-400/20">
                    Gemini
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {activeRoleConfig.taskType} • {activeRoleConfig.modelTag}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Clear conversation history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleOpen}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Role / Model Selector Pills */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              Select Specialist Role & Model:
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-2 rounded-xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-sky-400 shadow-sm ring-2 ring-sky-500/15'
                        : 'bg-slate-100/60 border-slate-200/80 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {role.icon}
                      <span className="text-xs font-bold truncate text-slate-800">
                        {role.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-medium text-slate-500 mt-1 truncate">
                      {role.modelTag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-sky-600 text-white rounded-br-xs shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    <div
                      className={`flex items-center justify-between gap-3 mt-1.5 pt-1 text-[10px] ${
                        isUser ? 'text-sky-200' : 'text-slate-400 border-t border-slate-100'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {!isUser && m.modelUsed && (
                        <span className="font-mono text-[9px] text-sky-600 font-semibold">
                          {m.modelUsed}
                        </span>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  <span>Thinking with {activeRoleConfig.modelTag}...</span>
                </div>
              </div>
            )}

            {/* Error Message banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Error communicating with Gemini:</p>
                  <p className="text-[11px] mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Queries */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {activeRoleConfig.suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 text-[11px] font-medium whitespace-nowrap shrink-0 border border-slate-200/60 transition disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask ${activeRoleConfig.name}...`}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-40 disabled:hover:bg-sky-600 shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
