import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, User, Send, Settings, PanelLeftClose, PanelLeft, Database, X, Loader2, MessageSquare, Phone, CheckCircle2, Clock, Coins, RefreshCw, ChevronDown, ExternalLink, Eye, Trash2, Check, Plus, LayoutDashboard, FileText, Sun, Moon, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import type { Message, ChatRequest, Lead } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { EnquiryForm } from './components/EnquiryForm';
import { FAQ } from './components/FAQ';

const SUGGESTIONS = [
  "What is the plot booking process?",
  "Tell me about the commission structure.",
  "Which banks are approved for loans?",
  "What documents are needed for booking?"
];

const TypewriterMarkdown = ({ text, isTyping, onType }: { text: string, isTyping: boolean, onType?: () => void }) => {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : text);
  const onTypeRef = useRef(onType);

  useEffect(() => {
    onTypeRef.current = onType;
  }, [onType]);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      if (i >= text.length) {
        clearInterval(interval);
        setDisplayedText(text);
      } else {
        setDisplayedText(text.substring(0, i));
      }
      onTypeRef.current?.();
    }, 10);

    return () => clearInterval(interval);
  }, [isTyping, text]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

const DEFAULT_KNOWLEDGE_BASE = `COMPANY TRAINING MATERIAL - LOHITHADHARMA PROJECTS PVT, LTD.

1. PLOT BOOKING PROCESS:
- To book a plot, the customer must pay a token advance of Rs. 1,00,000.
- The remaining 20% of the plot value must be paid within 15 days as the allotment amount.
- Registration will be done only after 100% payment is cleared.

2. CANCELLATION & REFUND POLICY:
- If a booking is cancelled within 7 days, 100% of the token advance is refunded.
- If cancelled after 7 days but before 15 days, a 10% cancellation charge applies to the advance.
- Refunds will be processed within 14 working days via bank transfer.

3. LEAD MANAGEMENT FOLLOW-UP:
- Hot Leads: Must be contacted within 2 hours. Schedule a site visit immediately.
- Warm Leads: Follow up within 24 hours. Send project brochures via WhatsApp.
- Cold Leads: Follow up once a week with project updates.

4. SITE VISIT GUIDELINES:
- Always confirm the site visit 1 hour before the scheduled time.
- Share your live location with the customer when you start.
- Carry hard copies of the project layout and price sheet.`;

export default function App() {
  const [knowledgeBase, setKnowledgeBase] = useState(DEFAULT_KNOWLEDGE_BASE);
  const [sessions, setSessions] = useState<Record<string, { title: string, messages: Message[], totalTokens?: number }>>(() => {
    const saved = localStorage.getItem('chat_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sessions from local storage', e);
      }
    }
    return {
      "current": {
        title: "Current Session",
        totalTokens: 0,
        messages: [
          {
            id: "init",
            role: "model",
            text: "Hello! I am the Agent Training AI Bot for Lohithadharma Projects PVT, LTD. You can ask me questions about company policies, plot bookings, lead management, and more. I can also answer in Telugu if you prefer."
          }
        ]
      },
      "cancel": {
        title: "Cancellation Policy details",
        messages: [
          { id: "c1", role: "user", text: "What is the cancellation policy?" },
          { id: "c2", role: "model", text: "According to the company policy:\n\n- If a booking is cancelled within 7 days, 100% of the token advance is refunded.\n- If cancelled after 7 days but before 15 days, a 10% cancellation charge applies to the advance.\n- Refunds will be processed within 14 working days via bank transfer." }
        ]
      },
      "leads": {
        title: "Lead follow-up guidelines",
        messages: [
          { id: "l1", role: "user", text: "What are the rules for lead follow up?" },
          { id: "l2", role: "model", text: "- Hot Leads: Must be contacted within 2 hours. Schedule a site visit immediately.\n- Warm Leads: Follow up within 24 hours. Send project brochures via WhatsApp.\n- Cold Leads: Follow up once a week with project updates." }
        ]
      }
    };
  });
  const [activeSessionId, setActiveSessionId] = useState<string>("current");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'enquiry' | 'faq'>('dashboard');
  
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('sales_leads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse leads from local storage', e);
      }
    }
    return [];
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAddLead = (leadInfo: Omit<Lead, 'id' | 'timestamp' | 'status'>) => {
    const newLead: Lead = {
      ...leadInfo,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'New'
    };
    setLeads([newLead, ...leads]);
  };

  const handleUpdateLeadStatus = (id: string, status: Lead['status']) => {
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status } : lead));
  };

  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('sales_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Web Speech API is not supported in this browser. Try Google Chrome.");
        return;
      }
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInput(prev => {
            const space = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + space + transcript;
          });
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.style.height = 'auto';
              textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
            }
          }, 50);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    }
  };
  
  const messages = sessions[activeSessionId].messages;
  
  const setMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setSessions(prev => {
      const updatedMessages = typeof newMessages === 'function' ? newMessages(prev[activeSessionId].messages) : newMessages;
      return {
        ...prev,
        [activeSessionId]: {
          ...prev[activeSessionId],
          messages: updatedMessages
        }
      };
    });
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsSettingsOpen(false);
    }, 1000);
  };


  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent | string) => {
    if (typeof e !== 'string') e?.preventDefault();
    const textToSend = typeof e === 'string' ? e : input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const chatRequest: ChatRequest = {
        messages: newMessages,
        knowledgeBase
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequest)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch response');
      }

      const data = await res.json();
      
      const newMessageId = (Date.now() + 1).toString();
      setTypingMessageId(newMessageId);

      setMessages(prev => [...prev, {
        id: newMessageId,
        role: 'model',
        text: data.text
      }]);

      if (data.usage?.totalTokenCount) {
        setSessions(prev => ({
          ...prev,
          [activeSessionId]: {
            ...prev[activeSessionId],
            totalTokens: (prev[activeSessionId].totalTokens || 0) + data.usage.totalTokenCount
          }
        }));
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || 'An unknown error occurred.';
      
      const errorMsgId = (Date.now() + 1).toString();
      setTypingMessageId(errorMsgId);

      setMessages(prev => [...prev, {
        id: errorMsgId,
        role: 'model',
        text: `**Error:** ${errorMessage}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    const newSessions = { ...sessions };
    delete newSessions[idToDelete];
    setSessions(newSessions);
    if (activeSessionId === idToDelete) {
      setActiveSessionId('current');
    }
  };

  const handleEndChat = () => {
    setActiveSessionId('current');
    setSessions(prev => {
      const currentSession = prev[activeSessionId];
      if (currentSession.messages.length <= 1 && activeSessionId === 'current') {
        return prev;
      }
      
      if (activeSessionId !== 'current') {
        return prev;
      }
      
      const newId = Date.now().toString();
      
      const title = currentSession.messages.find(m => m.role === 'user')?.text || "Previous Chat";

      return {
        ...prev,
        [newId]: {
          ...currentSession,
          title
        },
        'current': {
          title: "Current Session",
          totalTokens: 0,
          messages: [
            {
              id: "init",
              role: "model",
              text: "Hello! I am the Agent Training AI Bot for Lohithadharma Projects PVT, LTD. You can ask me questions about company policies, plot bookings, lead management, and more. I can also answer in Telugu if you prefer."
            }
          ]
        }
      }
    });
  };

  const userQueriesCount = messages.filter(m => m.role === 'user').length;

  return (
    <div className={cn("flex h-screen w-full fixed inset-0 font-sans overflow-hidden transition-colors duration-200", isDark ? "bg-[#0e1117] text-white" : "bg-[#F8FAFC] text-slate-900")}>
      
      {/* Sidebar */}
      <div className={cn("w-72 flex flex-col shrink-0 transition-colors duration-200", isDark ? "bg-[#151923] border-r border-[#1e2433]" : "bg-white border-r border-slate-200")}>
        <div className={cn("p-6 border-b transition-colors duration-200", isDark ? "border-[#1e2433]" : "border-slate-200")}>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-bold text-lg transition-colors duration-200", isDark ? "text-slate-200" : "text-slate-800")}>Agent Training Bot</span>
          </div>
          <p className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-slate-500" : "text-slate-400")}>Lohithadharma Projects</p>
        </div>

        <div className="flex-1 py-4 px-4 overflow-y-auto flex flex-col styled-scrollbar">
          <div className={cn("space-y-1 mb-6 border-b pb-6 transition-colors duration-200", isDark ? "border-[#1e2433]" : "border-slate-200")}>
            <button
               onClick={() => setActiveTab('dashboard')}
               className={cn("flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-all duration-200", 
                 activeTab === 'dashboard' 
                   ? (isDark ? "bg-indigo-950/40 text-indigo-400 border border-indigo-900/30" : "bg-indigo-50 text-indigo-700") 
                   : (isDark ? "text-slate-400 hover:bg-[#1e2433]" : "text-slate-600 hover:bg-slate-50")
               )}
            ><LayoutDashboard className="w-5 h-5"/> Leads Dashboard</button>
            <button
               onClick={() => setActiveTab('enquiry')}
               className={cn("flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-all duration-200", 
                 activeTab === 'enquiry' 
                   ? (isDark ? "bg-indigo-950/40 text-indigo-400 border border-indigo-900/30" : "bg-indigo-50 text-indigo-700") 
                   : (isDark ? "text-slate-400 hover:bg-[#1e2433]" : "text-slate-600 hover:bg-slate-50")
               )}
            ><FileText className="w-5 h-5"/> Enquiry Form</button>
            <button
               onClick={() => setActiveTab('faq')}
               className={cn("flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-all duration-200", 
                 activeTab === 'faq' 
                   ? (isDark ? "bg-indigo-950/40 text-indigo-400 border border-indigo-900/30" : "bg-indigo-50 text-indigo-700") 
                   : (isDark ? "text-slate-400 hover:bg-[#1e2433]" : "text-slate-600 hover:bg-slate-50")
               )}
            ><Database className="w-5 h-5"/> Help & FAQ</button>
          </div>

          <button
            onClick={() => {
              if (messages.length > 1) {
                handleEndChat();
              } else {
                setActiveSessionId('current');
              }
            }}
            className={cn(
              "flex items-center gap-2 w-full p-2.5 rounded-lg text-sm font-medium transition-colors mb-6 shadow-sm border",
              isDark 
                ? "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700" 
                : "bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700"
            )}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          <div className="mb-6">
            <h3 className={cn("text-[10px] font-bold uppercase tracking-widest mb-3 px-2", isDark ? "text-slate-500" : "text-slate-400")}>Active Chat</h3>
            <div className="space-y-1">
              <div 
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer transition-colors shadow-sm", 
                  isDark ? "bg-[#1e2433] text-slate-200 border border-[#2a303f]" : "bg-white text-slate-800 border border-slate-200"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></div>
                <span className="truncate font-medium">
                  {sessions[activeSessionId]?.messages.filter(m => m.role === 'user').length > 0 
                    ? sessions[activeSessionId]?.messages.find(m => m.role === 'user')?.text 
                    : sessions[activeSessionId]?.title || "Current Session"}
                </span>
              </div>
            </div>
          </div>

          {Object.keys(sessions).filter(k => k !== 'current' && k !== activeSessionId).length > 0 && (
            <div className="mb-6">
              <h3 className={cn("text-[10px] font-bold uppercase tracking-widest mb-3 px-2", isDark ? "text-slate-500" : "text-slate-400")}>Recent Chats</h3>
              <div className="space-y-1">
                {Object.entries(sessions).filter(([id]) => id !== activeSessionId && id !== 'current').reverse().map(([id, session]) => (
                  <div 
                    key={id}
                    onClick={() => { setActiveSessionId(id); }}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer transition-colors group", 
                      isDark ? "text-slate-400 hover:bg-[#1e2433]" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:text-indigo-600 transition-colors" />
                    <span className="truncate flex-1">
                      {session.title}
                    </span>
                    <button 
                      onClick={(e) => handleDeleteSession(e, id)}
                      className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={cn("p-4 border-t transition-colors duration-200", isDark ? "border-[#1e2433] bg-[#1a1e2b]" : "border-slate-200 bg-slate-50")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden bg-center bg-cover" style={{backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Agent")'}}></div>
              <div className="text-xs">
                <div className={cn("font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Sales Agent</div>
                <div className={cn("text-slate-500", isDark ? "text-slate-400" : "text-slate-500")}>Training Mode</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className={cn("flex-1 flex flex-col min-w-0 min-h-0 relative transition-colors duration-200", isDark ? "bg-[#0e1117]" : "bg-[#F8FAFC]")}>
        <header className={cn("h-16 border-b flex items-center justify-between px-8 shrink-0 z-10 sticky top-0 transition-colors duration-200", isDark ? "bg-[#151923] border-[#1e2433]" : "bg-white border-slate-200")}>
          <div className="flex items-center gap-3">
            <h2 className={cn("font-semibold text-lg transition-colors duration-200", isDark ? "text-slate-200" : "text-slate-800")}>
              {activeTab === 'faq' && 'Help & FAQ'}
              {activeTab === 'enquiry' && 'Enquiry Form'}
              {activeTab === 'dashboard' && 'Dashboard'}
            </h2>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className={cn("p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-xs font-semibold border shadow-sm",
              isDark 
                ? "bg-[#1e2433] border-[#2a303f] text-amber-400 hover:bg-[#2a303f] hover:border-[#3b445a]" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            )}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="text-slate-300">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700">Dark Mode</span>
              </>
            )}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto min-h-0 relative">
          {activeTab === 'enquiry' && (
            <EnquiryForm onAddLead={handleAddLead} isDark={isDark} />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard leads={leads} onUpdateStatus={handleUpdateLeadStatus} isDark={isDark} />
          )}

          {activeTab === 'faq' && (
            <FAQ isDark={isDark} />
          )}
        </div>
      </div>

      {/* Assistant Chat Column */}
      <div className={cn("w-96 flex flex-col shrink-0 border-l min-h-0 relative shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] transition-colors duration-200", isDark ? "bg-[#0e1117] border-[#1e2433]" : "bg-white border-slate-200")}>
        <div className={cn("h-16 border-b flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 transition-colors duration-200", isDark ? "bg-[#151923] border-[#1e2433]" : "bg-white border-slate-200")}>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500 animate-pulse" />
            <h2 className={cn("font-semibold transition-colors duration-200", isDark ? "text-slate-200" : "text-slate-800")}>Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={cn("p-1.5 rounded transition-colors duration-200", isDark ? "text-slate-400 hover:text-white hover:bg-slate-850" : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100")}
                title="Knowledge Base Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={handleEndChat}
                className={cn("p-1.5 rounded transition-colors duration-200", isDark ? "text-slate-400 hover:text-red-400 hover:bg-slate-855" : "text-slate-500 hover:text-red-650 hover:bg-slate-100")}
                title="End Chat Session"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 p-4 styled-scrollbar relative flex flex-col">
          <div className="w-full mx-auto space-y-6 pb-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 mt-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto max-w-2xl">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border", 
                  isDark ? "bg-indigo-950/30 border-indigo-900/50" : "bg-indigo-50 border-indigo-100"
                )}>
                  <Bot className="w-8 h-8 text-indigo-500" />
                </div>
                <h2 className={cn("text-xl md:text-2xl font-bold mb-2 text-center", isDark ? "text-slate-100" : "text-slate-800")}>Welcome to Agent Training</h2>
                <p className={cn("text-center mb-10 max-w-md mx-auto text-sm md:text-base leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>
                  I'm your AI sales assistant. I can answer questions about Lohithadharma Projects, booking processes, and commissions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(suggestion)}
                      className={cn("text-left p-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium group",
                        isDark 
                          ? "border-[#1e2433] bg-[#151923] text-slate-300 hover:border-indigo-500 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5" 
                          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5"
                      )}
                    >
                      <span className="text-indigo-500 mr-2 group-hover:opacity-100 opacity-0 transition-opacity">&rarr;</span>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={message.id}
                  className={cn(
                    "flex gap-4 w-full",
                    message.role === 'user' ? "flex-row-reverse max-w-2xl ml-auto" : "max-w-3xl"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    message.role === 'user' 
                      ? "bg-slate-200 text-slate-500" 
                      : "bg-indigo-600 text-white"
                  )}>
                    {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed",
                    message.role === 'user'
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                      : (isDark 
                          ? "bg-[#151923] border border-[#1e2433] text-slate-200 rounded-tl-none" 
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-none")
                  )}>
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    ) : (
                      <div className={cn("markdown-body prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-strong:font-semibold",
                        isDark ? "text-slate-250 prose-strong:text-white prose-headings:text-white" : "text-slate-800 prose-strong:text-slate-900"
                      )}>
                        <TypewriterMarkdown 
                          text={message.text} 
                          isTyping={message.id === typingMessageId}
                          onType={scrollToBottom}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 max-w-3xl w-full"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white">
                  <Bot className="w-6 h-6" />
                </div>
                <div className={cn("rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2 border", 
                  isDark ? "bg-[#151923] border-[#1e2433]" : "bg-white border border-slate-200"
                )}>
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                  <span className={cn("text-[15px] font-medium", isDark ? "text-slate-400" : "text-slate-500")}>Searching knowledge base...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        <div className={cn("p-4 border-t shrink-0 transition-colors duration-200", isDark ? "bg-[#151923] border-[#1e2433]" : "bg-white border-slate-200")}>
          <div className="w-full">
            <div className="relative flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask assistant..."
                rows={1}
                className={cn("w-full border-none rounded-xl py-3 pl-4 pr-24 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none overflow-y-auto styled-scrollbar text-sm transition-colors duration-200",
                  isDark ? "bg-[#1e2433] text-slate-100 placeholder:text-slate-500" : "bg-slate-100 text-slate-700 placeholder:text-slate-400"
                )}
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={cn("p-2 rounded-lg transition-colors relative group",
                    isListening 
                      ? "bg-red-500 text-white animate-pulse" 
                      : (isDark ? "text-slate-400 hover:text-slate-200 hover:bg-[#2a303f]" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200")
                  )}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-350 disabled:text-slate-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            {sessions[activeSessionId]?.totalTokens !== undefined && sessions[activeSessionId]?.totalTokens > 0 && (
              <div className="mt-2 flex justify-between px-1">
                <span className={cn("text-[10px] flex items-center gap-1", isDark ? "text-slate-500" : "text-slate-400")}>
                  Tokens Used: {sessions[activeSessionId].totalTokens.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn("rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh] border transition-colors duration-200", isDark ? "bg-[#151923] border-[#1e2433] text-slate-100" : "bg-white border-slate-200 text-slate-800")}
            >
              <div className={cn("flex items-center justify-between p-6 border-b transition-colors duration-200", isDark ? "border-[#1e2433]" : "border-slate-200")}>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-semibold text-lg">Knowledge Base Settings</h2>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className={cn("p-2 rounded-lg transition-colors duration-200", isDark ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-400 hover:bg-slate-100")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <p className={cn("text-sm mb-4 transition-colors duration-200", isDark ? "text-slate-400" : "text-slate-500")}>
                  Edit the text below to update the knowledge base. The AI will strictly use this information to answer user queries.
                </p>
                <textarea
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                  className={cn("w-full h-80 p-4 text-sm font-mono border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none styled-scrollbar transition-colors duration-200",
                    isDark ? "bg-[#1e2433] text-slate-100 border-[#2a303f]" : "bg-slate-50 text-slate-700 border-slate-200"
                  )}
                />
              </div>
              <div className={cn("p-6 border-t flex justify-end transition-colors duration-200", isDark ? "border-[#1e2433] bg-[#1a1e2b]" : "border-slate-200 bg-slate-50")}>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaved}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors w-36 flex items-center justify-center gap-2"
                >
                  {isSaved ? (
                     <>
                       <Check className="w-4 h-4" />
                       Saved!
                     </>
                  ) : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
