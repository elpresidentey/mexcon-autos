import { useEffect, useRef, useState } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const STORAGE_KEY = 'mexcon-chat-history';
const SUGGESTIONS = [
  'Do you have a Corolla water pump?',
  'What Toyota parts do you stock?',
  'What brands do you carry?',
  'OEM 16100-29065',
];

const loadHistory = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    return parsed.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string').slice(-20);
  } catch {
    return [];
  }
};

/** Very small renderer for the assistant's markdown-ish text: bold, bullets, line breaks. */
const renderText = (text: string) => {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const isBullet = /^[-•*]\s+/.test(trimmed);
    const content = trimmed.replace(/^[-•*]\s+/, '');
    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={j}>{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );
    if (isBullet) {
      nodes.push(
        <li key={i} className="list-disc ml-4">
          {parts}
        </li>
      );
    } else if (trimmed) {
      nodes.push(<p key={i}>{parts}</p>);
    }
  });
  return nodes;
};

const BotAvatar = ({ size = 'h-8 w-8' }: { size?: string }) => (
  <span
    className={`${size} rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0 shadow-sm`}
  >
    <SparklesIcon className="w-4 h-4 text-white" />
  </span>
);

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const userMessage: ChatMessage = { role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const post = async (attempt: number): Promise<{ reply?: string; error?: string }> => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        });
        if (!res.ok && res.status >= 500 && attempt < 2) {
          await new Promise((r) => setTimeout(r, 1200));
          return post(attempt + 1);
        }
        return await res.json().catch(() => ({}));
      } catch {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1200));
          return post(attempt + 1);
        }
        throw new Error('network');
      }
    };

    try {
      const data = await post(0);
      const reply: string =
        data?.reply || data?.error || 'Sorry, I could not answer that just now. Please WhatsApp us on +234 903 577 7779.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Something went wrong. Please try again or WhatsApp us on +234 903 577 7779.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <>
      {/* Launcher (sits above the WhatsApp float) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-5 z-40 group flex items-center"
          aria-label="Ask Mexcon AI assistant"
          title="Ask Mexcon AI assistant"
        >
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1.5 bg-dark-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask our AI assistant
          </span>
          <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 hover:from-primary-500 hover:to-primary-700 shadow-md transition-all">
            <SparklesIcon className="w-6 h-6 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent-400 rounded-full border-2 border-white" />
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm h-[min(62vh,30rem)] flex flex-col bg-white rounded-2xl shadow-[0_24px_80px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/5 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-primary-800 to-primary-600 text-white flex items-center gap-3">
            <BotAvatar />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">Mexcon Assistant</p>
              <p className="text-[11px] text-primary-100 leading-tight">AI parts assistant · live</p>
            </div>
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close chat"
              title="Close chat"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-metallic-50">
            {messages.length === 0 && (
              <div className="text-center py-6 px-2">
                <BotAvatar size="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm font-semibold text-ink">Hi! I'm the Mexcon parts assistant.</p>
                <p className="text-xs text-metallic-600 mt-1">
                  Ask me about parts in stock, brands, prices, delivery or fitment. Not sure? Try one of these:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs bg-white ring-1 ring-metallic-200 text-metallic-700 px-3 py-1.5 rounded-full hover:ring-primary-500 hover:text-primary-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && <BotAvatar size="h-7 w-7 mr-2 mt-1" />}
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                    m.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-white text-ink ring-1 ring-metallic-100 rounded-bl-md shadow-sm'
                  }`}
                >
                  {m.role === 'user' ? m.text : renderText(m.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <BotAvatar size="h-7 w-7 mr-2 mt-1" />
                <div className="bg-white ring-1 ring-metallic-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-metallic-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-metallic-400 rounded-full animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 bg-metallic-400 rounded-full animate-bounce [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            className="p-3 bg-white border-t border-metallic-100 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a part…"
              className="flex-1 min-w-0 bg-metallic-50 ring-1 ring-metallic-200 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-metallic-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;