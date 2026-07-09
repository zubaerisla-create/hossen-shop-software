'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        content: 'Hello! I am your Hossen Software Shop Asistant. How can I help you today? You can ask me about our readymade templates, custom software services, pricing, or support tickets!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const getSystemResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('price') || q.includes('pricing') || q.includes('cost') || q.includes('money') || q.includes('bdt')) {
      return 'Our readymade marketplace templates start from just 5,000 BDT. For bespoke engineering projects, our custom builds start at 50,000 BDT depending on complexity. Try our "AI Estimator" on the home page for a fast, detailed quotation!';
    }

    if (q.includes('custom') || q.includes('saas') || q.includes('app') || q.includes('website') || q.includes('build')) {
      return 'We build high-performance custom SaaS platforms, full agency web designs, mobile apps, and automated database setups. You can start a contract proposal immediately by logging into the Client Workspace and navigating to "Custom Projects".';
    }

    if (q.includes('support') || q.includes('ticket') || q.includes('help') || q.includes('bug') || q.includes('contact')) {
      return 'We offer 24/7 dedicated support. If you already purchased a template or started a custom deal, you can open a support ticket under the "Support Tickets" tab inside your portal dashboard. Alternatively, email us at support@apex-code.com.';
    }

    if (q.includes('buy') || q.includes('purchase') || q.includes('download') || q.includes('template')) {
      return 'Simply browse our templates marketplace, click on any product card, click the premium buy buttons, and follow our integrated checkout flow. Once purchased, the source code zip files are instantly unlocked in your portal dashboard!';
    }

    if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
      return 'Hello there! Let me know if you have any questions about our development stacks, templates, custom deals, or pricing options.';
    }

    return "Thank you for reaching out! To get custom solutions or sign design agreements, please sign up for a Client Workspace, click 'Start a New Custom Project', and chat directly with our lead developers.";
  };

  const submitUserMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const replyText = getSystemResponse(text);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitUserMessage(inputValue);
  };

  const suggestions = [
    { text: 'Custom SaaS & App builds', query: 'Tell me about custom saas development' },
    { text: 'How to buy templates?', query: 'How to purchase code templates?' },
    { text: 'Check project pricing', query: 'What is the pricing?' },
    { text: 'Get developer support', query: 'How to open a support ticket?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans text-xs">
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={handleOpenToggle}
          className="relative w-14 h-14 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group border border-zinc-800 dark:border-zinc-200"
          aria-label="Open support assistant chat"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-6 transition-transform" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border border-white dark:border-zinc-950 animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp transition-all duration-300">

          {/* Window Header */}
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold relative">
                <Sparkles className="w-4 h-4 text-white dark:text-black" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-zinc-950" />
              </div>
              <div>
                <span className="font-bold text-zinc-950 dark:text-white block">Hossen Software Shop Asistant</span>
                <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                  <span>AI Agent Online</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenToggle}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/10 scrollbar-thin">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed shadow-xs ${isUser
                        ? 'bg-zinc-950 dark:bg-white text-white dark:text-black rounded-tr-none'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-800 dark:text-zinc-250 rounded-tl-none'
                      }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <span className={`block text-[8px] mt-1.5 text-right ${isUser ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400 dark:text-zinc-550'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-0" />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-zinc-50/80 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-900 space-y-1.5">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Common Questions</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => submitUserMessage(sug.query)}
                    className="px-2.5 py-1 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 rounded-full transition-colors cursor-pointer text-left flex items-center gap-1 font-semibold"
                  >
                    <span>{sug.text}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input Form */}
          <form onSubmit={handleFormSubmit} className="p-3 border-t border-zinc-150 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-850 text-zinc-950 dark:text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-medium"
            />
            <button
              type="submit"
              className="bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs border border-zinc-850"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
