import React, { useState } from 'react';
import { Bot, Send, Sparkles, Code2, Bug, Zap } from 'lucide-react';

interface AIAssistantProps {
  currentCode: string;
  onApplyCode?: (code: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ currentCode, onApplyCode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Merhaba! Ben NovaCode AI Yardımcısıyım. Kodunuzu açıklayabilir, hataları tespit edebilir, algoritma üretebilir veya refactor edebilirim. Size nasıl yardımcı olabilirim?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // AI simülasyonu
    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('açıkla') || q.includes('explain')) {
        reply = `Kod analizi:\n- Mevcut dosyanızda ${currentCode.split('\n').length} satır kod var.\n- Fonksiyonel yapılar ve değişken tanımlamaları incelendi.\n- Kod genel olarak temiz ve standartlara uygun görünüyor.`;
      } else if (q.includes('hata') || q.includes('bug')) {
        reply = 'Kod tarandı: Ciddi bir syntax hatası tespit edilmedi. Null/undefined kontrollerini ve asenkron operasyonlarda try-catch bloklarını unutmayın.';
      } else if (q.includes('optimize') || q.includes('refactor')) {
        reply = 'Öneri: Tekrarlanan mantıkları yardımcı fonksiyonlara (utility functions) ayırabilir ve modern ES6+ sözdizimini (destructuring, optional chaining) kullanabilirsiniz.';
      } else {
        reply = `"${query}" isteğiniz analiz edildi. Düzenleyiciye veya koda entegre edilecek optimizasyon hazır!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full bg-nv-side border-l border-zinc-800 text-zinc-300">
      <div className="flex items-center space-x-2 px-3 py-2 bg-nv-side border-b border-zinc-800">
        <Sparkles size={15} className="text-purple-400" />
        <span className="font-semibold text-xs text-zinc-200">NovaCode Copilot & AI</span>
      </div>

      {/* Hızlı İşlemler */}
      <div className="flex items-center space-x-1.5 p-2 bg-nv-side border-b border-zinc-800/60 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSend('Mevcut kodu satır satır açıkla')}
          className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300 whitespace-nowrap"
        >
          <Code2 size={12} className="text-indigo-400" />
          <span>Kodu Açıkla</span>
        </button>
        <button
          onClick={() => handleSend('Bu kodda olası hataları ve bugları bul')}
          className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300 whitespace-nowrap"
        >
          <Bug size={12} className="text-rose-400" />
          <span>Hata Bul</span>
        </button>
        <button
          onClick={() => handleSend('Kodu optimize et ve refactor yap')}
          className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300 whitespace-nowrap"
        >
          <Zap size={12} className="text-amber-400" />
          <span>Optimize Et</span>
        </button>
      </div>

      {/* Mesaj Listesi */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-2.5 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800/70 text-zinc-200 border border-zinc-700/50'
              }`}
            >
              {m.sender === 'ai' && (
                <div className="flex items-center space-x-1 mb-1 text-[10px] text-purple-300 font-semibold">
                  <Bot size={12} />
                  <span>Nova AI</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-1 text-zinc-500 text-xs italic">
            <Sparkles size={12} className="animate-spin text-purple-400" />
            <span>AI düşünüyor...</span>
          </div>
        )}
      </div>

      {/* Input Alanı */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 bg-nv-side border-t border-zinc-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Yapay zekaya bir soru sor veya kod iste..."
          className="flex-1 bg-zinc-800 border border-zinc-700/70 rounded px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded transition-colors"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
};
